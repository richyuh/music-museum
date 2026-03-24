# Music Museum

**A virtual gallery for discovering the world's most important albums.**

Browse 1,173 albums across 52 genres — filtered by era, impact tier, and genre — in an infinite-scrolling gallery wall built for exploration. Every album is scored, tiered, and connected to adjacent genres so you always have somewhere new to go.

---

## Features

**Gallery Wall** — Infinite-scroll grid with virtual rendering. Filter by genre, decade (50s–20s), impact tier, and year range. Sort by impact, year, or title.

**Genre Rooms** — Curated landing pages for each genre with "Start Here" picks, "The Canon" essentials, adjacent genre connections, and hierarchical subgenre navigation.

**Impact Tiers** — Every album is scored 0–100 and classified as Landmark (top 10%), Essential (top 35%), or Notable. Scores are computed from MusicBrainz and Last.fm metadata.

**Album Detail** — Cover art, full summary, genre tags, subgenres, external links, and related albums from the same genre and adjacent genres.

**Smart Search** — PostgreSQL full-text search with English stemming and prefix matching, falling back to fuzzy matching.

**Library & Rooms** — Save albums to your library. Create custom rooms (collections) and organize albums within them.

**Admin Dashboard** — CRUD management for albums and genres with role-based access control.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Database | PostgreSQL + Prisma 7 |
| Styling | Tailwind CSS 4, Radix UI, Framer Motion |
| Auth | NextAuth.js 5 (credentials + bcrypt) |
| Search | PostgreSQL `tsvector` + GIN index |
| Performance | react-virtuoso (virtual scrolling), React Query |
| Testing | Vitest (unit) + Playwright (e2e) |
| CI/CD | GitHub Actions, Vercel |

---

## Data Pipeline

Albums are sourced through an automated pipeline:

1. **MusicBrainz** — metadata, release years, genre tags
2. **Last.fm** — album summaries and listening stats
3. **iTunes Search API** — high-resolution cover artwork
4. **Impact scoring** — composite scores computed from metadata, tiered by percentile

All data is baked into the seed files. Re-seeding is deterministic — no external API calls needed after initial import.

> **1,173 albums** | **52 genres** | **158 genre adjacencies** | **Decades: 1950s–2020s**

---

## Getting Started

```bash
# Clone and install
git clone https://github.com/richyuh/music-museum.git
cd music-museum
npm install

# Configure environment
cp .env.example .env
# Set DATABASE_URL, AUTH_SECRET in .env

# Set up database
npx prisma migrate dev
npx prisma db seed

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for NextAuth.js sessions |
| `ADMIN_PASSWORD` | Optional — sets admin account password during seed |

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run unit tests (Vitest)
npm run test:e2e     # Run e2e tests (Playwright)
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

---

## Architecture

```
src/
  app/                  # Next.js App Router pages + API routes
    album/[id]/         # Album detail (SSR)
    genre/[id]/         # Genre room (SSR)
    library/            # Saved albums & custom rooms
    admin/              # Admin dashboard & CRUD
    api/                # REST endpoints with Zod validation
  components/
    gallery/            # Gallery wall, filters, album cards
    layout/             # Header, navigation
    ui/                 # Radix-based design system
  lib/                  # Auth, search, rate limiting, utilities
  hooks/                # React Query hooks
prisma/
  schema.prisma         # Data model
  data/                 # Seed data (albums, genres, adjacencies)
  seed.ts               # Database seeder
e2e/                    # Playwright tests
```
