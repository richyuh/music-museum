# Music Museum — Notes

## Feature Ideas

### High Impact

- [ ] **Listen integration** — Embed Spotify/Apple Music 30-second previews directly on album cards
- [ ] **Timeline view** — Horizontal scrollable timeline showing albums by decade/year, visualizing genre evolution
- [ ] **Genre map** — Interactive network graph of genre relationships using existing adjacency data
- [ ] **Album of the Day** — Feature a random Landmark album on the homepage with its full summary

### Medium Impact

- [ ] **User reviews/ratings** — 1-5 star ratings and short reviews with aggregate scores on album cards
- [ ] **Journey mode** — Auto-generated album sequence that walks through related albums across adjacent genres and eras
- [ ] **Shareable rooms** — Public URLs for user-curated rooms
- [ ] **Compare albums** — Side-by-side view of two albums showing genres, era, impact, and relationships
- [ ] **Discovery feed** — "Because you saved X, you might like Y" based on genre/era overlap

### Polish and Delight

- [ ] **Album card flip animation** — Click to flip and see summary + links on the back
- [x] **Decade filter buttons** — Quick-tap 60s, 70s, 80s, etc. alongside the year slider
- [ ] **Genre color theming** — Tint the UI with the genre's color hex when browsing genre pages
- [ ] **Stats page** — Personal library summary (album count, top genres, favorite decades)
- [ ] **Keyboard navigation** — Arrow keys to browse gallery, Enter to open, Escape to close

---

## Scaling to 10K Albums

### Current Pipeline (1,173 albums)

| Step | Time | Bottleneck |
|---|---|---|
| Fetch metadata (MusicBrainz + Last.fm) | ~43 min | API rate limits (1.1s/request each) |
| Fetch covers (iTunes) | ~7 min | 3s/request rate limit |
| Seed to database | ~10 sec | Not a bottleneck |

### Scaling to 10,000 albums

| Step | Estimated Time | Notes |
|---|---|---|
| MusicBrainz metadata | ~3 hours | 1.1s/request, sequential |
| Last.fm summaries | ~3 hours | 1.1s/request, sequential |
| iTunes covers | ~8 hours | 3s/request, sequential |
| Database seed | ~2 min | Fast, not a concern |
| **Total (sequential)** | **~14 hours** | One-time cost, cached after |

### Key Challenges

1. **API rate limits dominate** — 90% of the time is waiting on Last.fm, MusicBrainz, and iTunes APIs
2. **Candidates list is manual** — `candidates.ts` is a hand-curated list (1,298 lines). At 10K this becomes unmaintainable
3. **No parallelization** — All scripts use sequential `await` loops
4. **File size growth** — `albums.ts` would grow from ~76 KB to ~650 KB (not a hard blocker)
5. **Caching saves you** — Once fetched, everything is cached locally (~9.8 MB currently). Subsequent runs skip already-fetched albums

### Optimizations to Make It Practical

- **Parallelize MB + Last.fm calls** (independent APIs) — cuts metadata fetch to ~3 hours total
- **Batch iTunes requests** with concurrency (5-10 parallel) — cuts covers to ~1.5 hours
- **Automate album discovery** — scrape lists from external sources instead of manual curation
- **Use `createMany()` in seed** — batch DB inserts instead of individual `create()` calls
- **Run overnight** — it's a one-time cost; with caching, re-runs are fast

### Estimated Time with Optimizations

| Step | Optimized Time |
|---|---|
| MusicBrainz + Last.fm (parallel) | ~3 hours |
| iTunes covers (5x concurrent) | ~1.5 hours |
| Database seed (batched) | ~1 min |
| **Total** | **~5 hours** |

Not complex, just slow. The pipeline already works — it just needs parallelization and a scalable album sourcing strategy. Run it overnight and you're done.

---

## Collection Analysis (1,173 albums)

- **Genre breakdown**: Rock dominates at 39.8%, followed by pop (27.6%), electronic (25.7%), hip-hop (18.8%), jazz (16.5%), folk/country (14.7%), R&B/soul (14.0%), metal (11.6%). Albums have multiple genres so percentages overlap.
- **Decade breakdown**: 1990s–2010s hold ~59% of the collection (236, 216, 239 albums respectively). 1970s is the next strongest decade at 154 (13.1%). 1940s–1950s are sparse (28 total).
- **Year 2000 spike**: 71 albums are tagged to the year 2000 — likely an artifact in the seed data worth investigating.
- **2020s gap**: Only 89 albums (7.6%) from the 2020s, tapering to just 3 from 2024 — room to expand recent coverage.

---

## Top 10 Most Impactful User Features

Ranked by user value, leveraging existing data model and infrastructure.

1. **Personalized recommendations** — "For You" section on homepage using saved albums to suggest related albums by genre overlap, era proximity, and impact score. The genre adjacency graph (158 connections) and user save data already exist to power this without external APIs.

2. **Shareable public rooms** — Add `isPublic` flag and `publicSlug` to UserRoom so users can share curated collections via URL. Public room pages with full OpenGraph metadata turn every collection into a shareable music guide. Currently rooms are private-only, locking away the strongest engagement loop.

3. **Artist pages** — `/artist/[name]` route showing full discography within the museum, bio context, and genre spread. Currently no artist-centric browsing exists — users who like one album by an artist have no path to find others. Artist data can be derived from existing `artistName` field.

4. **Search autocomplete** — Typeahead dropdown on the search input showing top matching albums and artists as the user types. Current search requires submitting a full query and navigating to `/search`. Autocomplete reduces friction and enables faster discovery.

5. **User library stats dashboard** — `/library/stats` page showing personal genre breakdown, decade distribution, save timeline, and room analytics. All data exists in UserSavedAlbum (with timestamps) and UserRoom relations. Turns passive saving into an engaging self-portrait.

6. **Genre network visualization** — Interactive force-directed graph of all 52 genres using the 158 GenreAdjacency connections and genre colorHex values. Click a genre node to navigate to its page. Makes the museum's genre taxonomy explorable and beautiful.

7. **Collaborative rooms** — Extend UserRoom with a collaborators relation so multiple users can curate a room together. Invite by email, real-time album additions. Transforms rooms from solo bookmarks into shared playlists.

8. **Trending and popular** — "Most Saved This Week" and "Rising Albums" sections powered by aggregating UserSavedAlbum.savedAt timestamps. Adds a social pulse to the museum — users can see what the community is discovering.

9. **Subgenre faceted filtering** — Multi-select filter using `subgenresJson` data already stored on every album. Current filtering is limited to 8 parent genres. Subgenre filtering lets users drill into "shoegaze" or "trip-hop" directly from the gallery.

10. **Album comparison view** — `/compare?albums=123,456` route showing two albums side-by-side: cover art, genres, subgenres, era, impact score, related genres. Useful for understanding what connects or distinguishes two albums. All data already exists on the Album model.

---

## Top 5 Coding Hygiene & Security Improvements

Ranked by risk and impact to production readiness.

1. **Enforce rate limiting on all API routes** — `src/lib/rate-limit.ts` exists but is not wired into any route handler. Signup, search, and library endpoints are all unprotected. Without rate limiting, brute-force attacks on auth, DoS via expensive full-text search queries, and credential stuffing are all possible. Wire `rateLimit()` into every API route with IP-based limits for public endpoints and user-based limits for authenticated ones.

2. **Fix inconsistent error handling and input validation** — `/api/library/rooms/[id]/albums/route.ts` bypasses `withErrorHandler()` and does raw `parseInt()` on `albumId` with no Zod validation. `/api/genres/[id]/route.ts` also skips validation on pagination params. Unify all routes to use `withErrorHandler` wrapper and Zod schema validation to prevent unhandled errors and malformed input.

3. **Tighten Content Security Policy** — `next.config.ts` sets `script-src 'self' 'unsafe-inline' 'unsafe-eval'` which defeats the purpose of CSP entirely. Replace with nonce-based script loading to actually protect against XSS. Also add missing headers: `Strict-Transport-Security`, `X-Download-Options`, `Permissions-Policy`.

4. **Add caching and fix N+1 queries** — Album detail pages make 4-5 sequential DB queries (album + related albums + album-of-the-day). Genre pages do a massive nested include across 5 relations. No page exports `revalidate` for ISR, and no API routes set `Cache-Control` headers. Add ISR (`revalidate: 3600`) to genre/album pages, cache album-of-the-day for 24 hours (it's deterministic), and batch related-album queries into a single CTE.

5. **Expand test coverage beyond 25%** — Only 5 of 20 API endpoints have tests. Zero React components, zero hooks, and zero page components are tested. Library routes (the core user feature) are entirely untested. Prioritize: library CRUD routes, `getRelatedAlbums()` scoring logic, `getAlbumOfTheDay()` hash logic, then hook-level tests for `useLibrary` and `useAlbums`.

---

## Revenue Strategy: Path to $2K MRR

Based on competitive market research across Letterboxd, music affiliate economics, newsletter sponsorships, creator tools, social listening platforms, premium community models, AI curation products, music commerce, and the direct competitor landscape (RYM, AOTY, Record Club, Last.fm, Discogs).

### Revenue Mix Target

No single feature gets there alone at early-stage traffic. The realistic path is a hybrid:

| Stream | Monthly target |
|--------|---------------|
| Premium memberships | $600–1,000 |
| Newsletter sponsorships | $400–700 |
| Affiliate commerce | $150–400 |
| Artist exhibit pages | $200–500 |
| **Total** | **$1,350–2,600** |

### Priority #1: Premium Membership — $5/mo or $40/yr

Letterboxd proved this model: ~$19M/yr revenue, 2-5% conversion on 17-21M users. The single feature that drives Pro conversion is **personalized stats** (their Wrapped-equivalent).

**What goes behind the paywall:**
- Taste profile & yearly listening stats (top genres, decades, discovery patterns)
- Spotify/Last.fm import to bootstrap collection
- Advanced collection management (custom lists, sorting, filtering)
- Ad-free experience
- Private listening rooms

**Target:** 150-200 subscribers = $750-1,000/mo.

**Competitive edge:** RYM charges for themes/charts. AOTY gives a badge. Record Club has a Supporter tier. None offer meaningful personalized stats.

### Priority #2: Weekly "Heatseekers" Newsletter with Sponsorships

Fastest time-to-revenue. Sponsors engage at just 1,000 subscribers with 40%+ open rates. Music audiences are high-intent; niche sponsors (audio brands, vinyl shops, festivals) pay $35-75 CPM.

**Format:** Weekly email — 1 album deep-dive, 3 underground picks, 1 sponsor slot. Free tier drives platform traffic; paid tier ($5/mo) adds bonus content.

**Revenue math at 2,500 subscribers:**
- Sponsorships at 50% open rate, $40 CPM = ~$500/mo
- 100 paid subscribers at $5/mo = ~$450/mo after platform cut
- Total: ~$700-950/mo

**Key context:** Ad-supported music editorial is dead. Pitchfork gutted (2024). Stereogum lost 70% of ad revenue to Google AI search. What survives is direct audience relationship + hybrid revenue (Ted Gioia's Honest Broker: 271K+ subscribers, 35% growth in 2025).

### Priority #3: Affiliate Commerce Layer

Zero marginal cost once implemented. Monetizes every Album Exhibit page passively.

**Key insight: lead with gear, not just vinyl.** A turntable at $250 with 3-4% Amazon commission ($7.50-10) is worth 5x more per sale than a $30 vinyl at 5% ($1.50).

**Integrations:**
- Merchbar: 5% commission, $50+ AOV, 7-day cookie (most turnkey)
- Amazon Associates: 5% on vinyl/CDs, 3-4% on electronics
- Rough Trade: 3% per sale
- StubHub tickets: 3-9% per sale

**Revenue at 25K monthly visitors:** ~$175-400/mo.

**Supporting data:** 23% of engaged music fans buy merch. Vinyl market hit $2.1B in 2024, growing 9% CAGR. The "reads reviews → buys vinyl" overlap is well-understood by labels.

### Priority #4: Artist Album Exhibit Pages — $20-50/mo

Gap between Linktree ($8-35/mo for a link list) and Bandzoogle ($7-25/mo for a full website). Album Exhibit fills the middle: richer than a link, cheaper than a website, culturally meaningful.

**What artists get:**
- Museum-quality album page with context, embedded streaming, visuals, reviews
- Fan engagement data (visits, listens, saves)
- "Submit to Heatseekers" for newsletter/platform featuring

**Revenue:** 20-40 artists at $25/mo = $500-1,000/mo.

**Sequencing note:** Chicken-and-egg problem. Artists pay for audience access, so this becomes viable after 10K+ monthly visitors. Launch as free beta for early artists, convert to paid once engagement data exists.

### Priority #5: Listening Rooms (Retention Driver)

Not a direct revenue feature, but the key retention driver that makes everything above convert. 64% of listeners say they miss "listening together." Every standalone social listening platform died (Turntable.fm, JQBX, Plug.dj) — licensing costs kill them. But as a **feature inside an existing platform**, it drives engagement → premium conversion.

**Implementation:** Use Spotify/Apple Music playback (users BYO stream) to avoid licensing costs. The social layer (chat, reactions, DJ rotation) is the value add.

**Revenue impact:** Private rooms gated behind Premium. Scheduled events drive newsletter growth. Artists can host release listening parties (exhibit page value).

### What NOT to Prioritize Yet

- **Generative Listening Worlds** — AI visualizers are maturing but consumer reception is mixed between "cool demo" and "use weekly." High build cost, unclear retention. Validate cheaply with one theme first.
- **Display advertising** — At early scale, ads generate $50-100/mo and degrade the experience. Only consider after 100K+ monthly visitors with a premium partner (Playwire grew Letterboxd's ad revenue 490%).

### Sequencing

- **Month 1-2:** Affiliate links on every Album Exhibit (Merchbar, Amazon gear). Newsletter launch with weekly Heatseekers. Both generate revenue immediately.
- **Month 3-4:** Premium membership with taste profiles and Spotify import. Letterboxd conversion engine kicks in.
- **Month 5-6:** Artist exhibit pages in paid beta. Listening rooms as free feature for retention.
- **Target:** $2K MRR by month 6-8.

### Competitive Landscape Summary

| Platform | Strengths | Weaknesses | Monetization |
|----------|-----------|------------|-------------|
| RateYourMusic | Deepest catalog, 1.3M users, 147M ratings | Frozen 2000s UI, no mobile, hostile to casuals | Optional subscriptions |
| Album of the Year | Best critic-score aggregation | Thin social, minimal editorial voice | Ads + subscriber tier + affiliate |
| Discogs | Definitive physical-release DB, $275M GMV | Collector-only, no discovery/social | 9% marketplace fees + ads |
| Last.fm | Unmatched scrobbling data | Stagnant, feels abandoned | Pro at €4.99/mo |
| Record Club | Clean UX, Letterboxd-for-music positioning | Early stage, small user base | Free + Supporter tier |
| Musicboard | 462K downloads | Outages, user boycott in 2026 | Freemium |

**Gap none fill well:** Editorial curation + community + design-forward UX in one place. Album-first discovery beyond just ratings. Monetization beyond ads/subscriptions.

---

## TODO

- [ ] **Automated X/Twitter posting** — Set up X API v2 (Free tier: 1,500 tweets/mo) to auto-post Album of the Day daily. Steps: (1) Create developer account at developer.x.com with @MusicMuseumApp, (2) Create Project + App, generate API Key, API Secret, Access Token, Access Token Secret, (3) Build a cron job (Vercel cron or GitHub Actions) that fetches Album of the Day and posts via `POST https://api.x.com/2/tweets` with OAuth 1.0a.
- [x] **Fill missing album covers** — Was 155 of 3,173 (~4.9%), now down to 15 (~0.5%). Added `backfill-mbids.ts` to re-query MusicBrainz with cleaned titles (strip parentheticals, EP suffixes, subtitles) — recovered 62 mbids. Fixed `bake-covers.ts` bugs: title+artist fallback for line-finding, duplicate-mbid guard, no-mbid cover patching. Recovered 140 covers total (124 iTunes, 16 CAA). Remaining 15 albums have no iTunes or CAA match — would need Discogs/Last.fm or manual covers.
- [ ] **Audit cover art accuracy** — iTunes fuzzy search can return the wrong cover (e.g., Die Lit by Playboi Carti returned a black heart image instead of the iconic stage-dive photo). Unknown how many other albums are affected. Consider cross-checking iTunes results against CAA, or building a manual review flow for flagged covers.

---

## Lessons Learned

- **Spotify API rate limiting** — Sending ~3,500 requests in rapid succession (concurrency 10, 100ms batch delay) triggered an extended 429 ban lasting 30+ minutes. The ban is per **client ID**, so regenerating the client secret does not help. Free tier limits you to 1 app, so you can't create a fresh app to bypass it. Fix: use concurrency of 5, 500ms batch delay, and avoid bulk runs with broken queries that double request count via fallback retries. Also: `encodeURIComponent` encodes `:` to `%3A`, which breaks Spotify's `album:` and `artist:` field filter syntax — build the URL manually instead of using `URLSearchParams` or `encodeURIComponent` on the full query string.
