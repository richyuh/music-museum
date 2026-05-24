# Album Ingestion Pipeline

## Overview

The pipeline discovers, enriches, and seeds albums into the Music Museum database.

```
candidates/*.ts  →  import:albums  →  albums.ts  →  db:seed  →  fetch-covers  →  bake-covers
(source list)       (API enrichment)   (data file)    (DB upsert)  (iTunes covers)   (persist covers)
```

## Pipeline Steps

### 1. Discover new albums (optional)

```bash
npx tsx prisma/import-albums/discover.ts
```

Uses Last.fm `tag.getTopAlbums` API to find albums by genre tag. Deduplicates against existing candidates and appends new entries to per-genre files in `prisma/import-albums/candidates/`.

- **Rate limit:** 1.1s/req (~70 sec for full run)
- **Output:** Appends to `candidates/*.ts` files + writes `.cache/discovered.json`
- **Quality filtering:** Excludes compilations, greatest hits, soundtracks
- **Dedup:** Normalized artist/title matching, cross-tag and cross-genre dedup

### 2. Import albums (fetch metadata)

```bash
npm run import:albums
```

Runs `prisma/import-albums/index.ts`. For each candidate:
1. Fetches MusicBrainz data (MBID, release year, tags, rating)
2. Fetches Last.fm data (listeners, playcount, summary, tags) — **in parallel** with MB
3. Fetches Spotify album IDs (if env vars set)
4. Computes impact score (0-99) and assigns tiers (Landmark/Essential/Notable)
5. Generates `prisma/data/albums.ts`

- **Rate limits:** MusicBrainz 1.1s/req, Last.fm 1.1s/req, Spotify 5 concurrent/500ms batch
- **Caching:** Results cached in `prisma/import-albums/.cache/{musicbrainz,lastfm}/`. Cached albums skip API calls entirely.
- **Time:** ~1.1s per new album (MB+Last.fm parallel). ~33 min for 1,800 new albums.
- **Env vars required:** `LASTFM_API_KEY` (required), `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` (optional)

### 3. Seed database

```bash
npm run db:seed
```

Runs `prisma/seed.ts`. Uses **upsert** logic — never deletes user data.

- **Albums:** Upserted by `mbid` (if available) or `title + artistName + releaseYear` compound unique
- **Genres:** Upserted by `slug`
- **Hero/Canon albums:** Cleared and recreated (positional, shift with scoring)
- **User data preserved:** Users, saved albums, rooms are never touched
- **Stale albums:** Albums in DB but removed from `albums.ts` are left in place

### 4. Fetch covers

```bash
npx tsx prisma/fetch-covers.ts
```

Fetches album cover art from iTunes Search API. Skips albums that already have non-placeholder covers.

- **Rate limit:** 3s/req (~90 min for 1,800 new albums)
- **Updates:** Writes directly to DB `coverUrl` field

### 5. Bake covers into albums.ts

```bash
npx tsx prisma/scripts/bake-covers.ts
```

Reads cover URLs from the database and embeds them into `prisma/data/albums.ts` so they persist across re-imports.

### 6. Update Spotify IDs (optional)

```bash
npx tsx prisma/update-spotify-ids.ts
```

Merges Spotify album IDs from import data into database `linksJson` fields.

## File Structure

```
prisma/
├── import-albums/
│   ├── candidates/          # Per-genre album candidate lists
│   │   ├── index.ts         # Barrel — re-exports merged candidates record
│   │   ├── rock.ts
│   │   ├── hip-hop.ts
│   │   ├── electronic.ts
│   │   ├── jazz.ts
│   │   ├── r-b-soul.ts
│   │   ├── pop.ts
│   │   ├── metal.ts
│   │   └── folk-country.ts
│   ├── .cache/              # Cached API responses (gitignored)
│   │   ├── musicbrainz/     # One JSON file per album
│   │   ├── lastfm/          # One JSON file per album
│   │   └── discovered.json  # Last discovery run output
│   ├── index.ts             # Main import pipeline
│   ├── discover.ts          # Last.fm album discovery script
│   ├── musicbrainz.ts       # MusicBrainz API client
│   ├── lastfm.ts            # Last.fm API client
│   ├── spotify.ts           # Spotify API client
│   ├── scoring.ts           # Impact score computation
│   ├── genre-mapping.ts     # Tag → genre slug mapping
│   ├── output.ts            # Generates albums.ts
│   └── cache.ts             # File-based cache utility
├── data/
│   ├── albums.ts            # Generated album data (DO NOT EDIT MANUALLY)
│   └── genres.ts            # Genre taxonomy
├── seed.ts                  # Database seeder (upsert mode)
├── fetch-covers.ts          # iTunes cover fetcher
├── update-spotify-ids.ts    # Spotify ID syncer
└── scripts/
    └── bake-covers.ts       # Bakes cover URLs into albums.ts
```

## Caching

All API responses are cached in `prisma/import-albums/.cache/`:
- **Key format:** `{artist}--{title}` normalized (lowercase, non-alphanumeric → underscore, max 200 chars)
- **Cache hit:** Returns instantly, no API call
- **Cache miss:** Calls API, writes result to cache
- **To re-fetch an album:** Delete its JSON file from the cache directory
- **To re-fetch everything:** Delete the entire `.cache/` directory

Cache is ~10-20 MB for 3,000 albums. It's gitignored.

## API Rate Limits

| API | Rate Limit | Retry Strategy | Risk |
|-----|-----------|----------------|------|
| MusicBrainz | 1 req/sec | 3 retries, exponential backoff on 429/503 | Low |
| Last.fm | ~1 req/sec | 3 retries, exponential backoff on 429 | Low |
| Spotify | 5 concurrent, 500ms batch delay | 3 retries, backoff on 429/500+ | **Medium** — aggressive use triggers 30+ min ban per client ID |
| iTunes | ~20/min (3s delay) | No retry, silent null on failure | Low |

## Troubleshooting

### Spotify rate limit ban
Spotify bans are per **client ID** and last 30+ minutes. Regenerating the client secret does NOT help. To avoid:
- Use concurrency of 5, 500ms batch delay
- Don't run bulk imports with broken queries that cause fallback retries
- `encodeURIComponent` breaks Spotify's `album:` field filter syntax — the code uses manual URL building

If banned, skip Spotify enrichment by not setting `SPOTIFY_CLIENT_ID`/`SPOTIFY_CLIENT_SECRET` env vars, then run `update-spotify-ids.ts` later.

### Missing MBIDs
Albums that fail MusicBrainz lookup get `mbid: null` and default metadata (score=50, year=2000). Check the import log for errors and verify the artist/title spelling matches MusicBrainz.

### Duplicate handling
- **Schema constraints:** `mbid` is unique, `title + artistName + releaseYear` is unique
- **Upsert logic:** Existing albums are updated, not duplicated
- **Candidates dedup:** `index.ts` deduplicates by lowercase `artist|||title` key, merging genre arrays

### Adding albums manually
Add entries to the appropriate `prisma/import-albums/candidates/*.ts` file:
```typescript
{ artist: "Artist Name", title: "Album Title" },
```
Then run `npm run import:albums` followed by `npm run db:seed`.

## Quick Reference: Full Pipeline Run

```bash
# Discover new candidates from Last.fm (optional, ~70 sec)
npx tsx prisma/import-albums/discover.ts

# Import all albums — cached ones skip instantly (~33 min for 1,800 new)
npm run import:albums

# Seed database with upsert (~1-2 min)
npm run db:seed

# Fetch covers for new albums (~90 min for 1,800 new)
npx tsx prisma/fetch-covers.ts

# Bake cover URLs into albums.ts for persistence
npx tsx prisma/scripts/bake-covers.ts
```
