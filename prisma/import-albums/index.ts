import "dotenv/config";
import { candidates } from "./candidates.js";
import { fetchMusicBrainz } from "./musicbrainz.js";
import { fetchLastfm } from "./lastfm.js";
import { fetchAllSpotify } from "./spotify.js";
import { computeScore, assignTiers, type ScoredAlbum } from "./scoring.js";
import { mapTags } from "./genre-mapping.js";
import { generateAlbumsFile } from "./output.js";

async function main() {
  if (!process.env.LASTFM_API_KEY) {
    console.error("Error: LASTFM_API_KEY env var is required");
    console.error("Get a free key at https://www.last.fm/api/account/create");
    process.exit(1);
  }

  console.log("Music Museum Album Import Pipeline\n");

  // 1. Flatten and deduplicate candidates
  const seen = new Map<string, { artist: string; title: string; genres: string[] }>();

  for (const [genre, albumList] of Object.entries(candidates)) {
    for (const { artist, title } of albumList) {
      const key = `${artist.toLowerCase()}|||${title.toLowerCase()}`;
      const existing = seen.get(key);
      if (existing) {
        // Merge genres
        if (!existing.genres.includes(genre)) {
          existing.genres.push(genre);
        }
      } else {
        seen.set(key, { artist, title, genres: [genre] });
      }
    }
  }

  const uniqueCandidates = Array.from(seen.values());
  console.log(`Total unique candidates: ${uniqueCandidates.length}\n`);

  // 2. Fetch data from APIs
  const results: ScoredAlbum[] = [];
  let fetched = 0;
  let errors = 0;

  for (const candidate of uniqueCandidates) {
    fetched++;
    if (fetched % 25 === 0 || fetched === 1) {
      console.log(
        `[${fetched}/${uniqueCandidates.length}] Fetching: ${candidate.artist} - ${candidate.title}`
      );
    }

    try {
      // Fetch from both APIs
      const mb = await fetchMusicBrainz(candidate.artist, candidate.title);
      const lastfm = await fetchLastfm(candidate.artist, candidate.title);

      // Determine release year
      const releaseYear = mb.releaseYear || 2000; // fallback

      // Map genres from API tags + candidate's declared genres
      const allTags = [...mb.tags, ...lastfm.tags];
      const genres = mapTags(allTags, candidate.genres);

      // Compute score
      const impactScore = computeScore(mb, lastfm, releaseYear);

      results.push({
        title: candidate.title,
        artist: candidate.artist,
        releaseYear,
        genres,
        mbid: mb.mbid,
        impactScore,
        impactTier: "Notable", // Will be assigned by percentile later
        summary: lastfm.summary,
        listeners: lastfm.listeners,
        playcount: lastfm.playcount,
      });
    } catch (err) {
      errors++;
      console.error(
        `  Error fetching ${candidate.artist} - ${candidate.title}: ${err}`
      );
      // Still add with defaults
      results.push({
        title: candidate.title,
        artist: candidate.artist,
        releaseYear: 2000,
        genres: candidate.genres,
        mbid: null,
        impactScore: 50,
        impactTier: "Notable",
        summary: null,
        listeners: 0,
        playcount: 0,
      });
    }
  }

  console.log(`\nFetched ${fetched} albums (${errors} errors)`);

  // 2b. Fetch Spotify data in parallel batch
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.log("\nWarning: SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set, skipping Spotify enrichment");
  } else {
    const spotifyMap = await fetchAllSpotify(uniqueCandidates);
    for (const album of results) {
      const key = `${album.artist.toLowerCase()}|||${album.title.toLowerCase()}`;
      const spotify = spotifyMap.get(key);
      if (spotify) {
        album.spotifyAlbumId = spotify.spotifyAlbumId;
      }
    }
  }

  // 3. Assign tiers by percentile
  assignTiers(results);

  // 4. Generate output file
  await generateAlbumsFile(results);

  console.log("\nDone! Next steps:");
  console.log("  1. npm run db:seed");
  console.log("  2. npx tsx prisma/fetch-covers.ts");
  console.log("  3. npm run dev");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
