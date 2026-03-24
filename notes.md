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
- [ ] **Decade filter buttons** — Quick-tap 60s, 70s, 80s, etc. alongside the year slider
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
