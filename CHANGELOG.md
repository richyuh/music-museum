# Changelog

All notable changes to Music Museum are documented here.

## 2026-03-24

### fix: add PostgreSQL service for CI e2e tests ([#13](https://github.com/richyuh/music-museum/pull/13))
- Add PostgreSQL 16 service container to the e2e CI job so Playwright tests have a database to run against
- Includes health checks to ensure Postgres is ready before steps run

### feat: add decade filter buttons with e2e tests ([#11](https://github.com/richyuh/music-museum/pull/11))
- Quick-tap decade buttons (50s–20s) in the gallery filter bar for faster year-range filtering
- Styled consistently with impact tier toggles; syncs with existing year slider via URL params
- Install `@playwright/test` and add 5 Playwright e2e tests

## 2026-03-23

### feat: migrate from SQLite to PostgreSQL ([#6](https://github.com/richyuh/music-museum/pull/6))
- Migrate database from SQLite to PostgreSQL (Neon) for Vercel serverless deployment
- Replace SQLite FTS5 full-text search with PostgreSQL `to_tsvector`/`to_tsquery` + GIN index
- Swap `@prisma/adapter-better-sqlite3` for `@prisma/adapter-pg`

### feat: bake iTunes cover URLs into seed data ([#5](https://github.com/richyuh/music-museum/pull/5))
- Bake 1,035 iTunes cover URLs directly into `prisma/data/albums.ts` so covers persist across re-seeds
- Previously, re-seeding wiped all covers since they were only stored in the DB

### feat: show full album summaries with Read more toggle ([#4](https://github.com/richyuh/music-museum/pull/4))
- Remove 250-character truncation limit from Last.fm import pipeline
- Re-fetch full summaries for 840 previously truncated albums
- Add `AlbumSummary` component with "Read more" / "Show less" toggle

### feat: add tooltips to impact tier filter buttons ([#3](https://github.com/richyuh/music-museum/pull/3))
- Hover tooltips on Landmark, Essential, and Notable filter buttons explaining what each tier means

## 2026-03-22

### feat: expand album collection to 1,173 via import pipeline ([#2](https://github.com/richyuh/music-museum/pull/2))
- Data-driven import pipeline fetching metadata from MusicBrainz and Last.fm APIs
- Composite impact scores with tier assignment by percentile
- Replaces ~493 hand-scored albums with 1,173 enriched entries across 8 genres

### feat: productionize MVP ([#1](https://github.com/richyuh/music-museum/pull/1))
- API hardening: all 11 routes with Zod validation, error handling, rate limiting
- Security: CSP headers, env validation, SQL injection fix
- Error UX: global error boundaries, toast notifications
- Accessibility: proper ARIA labels, 44px touch targets, keyboard navigation
- Testing: 67 vitest tests (unit + API integration), Playwright e2e skeleton
- CI: GitHub Actions pipeline (type-check, lint, test, build)

### Initial release
- Music Museum MVP — virtual album art gallery with genre filtering, year range slider, impact tier toggles, search, user auth, saved albums, and curated rooms
