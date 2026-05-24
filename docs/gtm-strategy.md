# Music Museum — Go-to-Market Strategy

## Context

Music Museum is a Letterboxd-for-music platform with 1,173 curated albums, 52 genres, user accounts, library/rooms, Album of the Day, and Amazon affiliate links (tag: `musicmuseum-20`). Deployed on Vercel + Neon PostgreSQL. The goal is $2K MRR within 6-8 months through a hybrid of affiliate commerce, premium memberships, newsletter sponsorships, and artist exhibit pages. This plan synthesizes research from 5 agents covering GTM strategy, SEO, social media automation, Reddit/community seeding, and influencer outreach.

## Readiness Assessment

**Ready to launch:** Core product is 85-90% there — browsing, auth, library, rooms, admin tools, CI/CD, responsive design, affiliate commerce. What's missing are analytics (can't measure GTM success without them), error tracking, share buttons (the #1 virality mechanic), and rate limiting. Analytics and share buttons should ship before GTM push.

**Critical pre-launch tasks (1-2 days of work):**
1. Add analytics (Plausible or PostHog — privacy-respecting, free tier)
2. Add share buttons to album pages (shareable collection cards are the growth engine — Musicboard grew to 400K users via shared review cards)
3. Add sitemap.xml via Next.js `app/sitemap.ts`
4. Submit to Google Search Console

---

## Phase 1: Foundation (Weeks 1-2)

### SEO — Your 1,173-Page Structural Advantage

Your album and genre pages are a built-in long-tail SEO machine. Competitors like AOTY and RYM rank for `"[album] review"` and `"best [genre] albums"` — you can too.

**Priority actions:**
1. **Add sitemap.xml** — Immediate, highest ROI. Use Next.js `app/sitemap.ts` to auto-generate
2. **Add JSON-LD structured data** to album pages — `MusicAlbum` + `Review` + `BreadcrumbList` schema.org types. This unlocks rich results and AI Overview citations
3. **Optimize meta descriptions** — Truncate to ~155 chars, front-load: `"[Title] by [Artist] ([Year]) - [Genre]. [First sentence of summary]..."`
4. **Consider URL slug migration** — `/album/[slug]` (e.g., `nevermind-nirvana-1991`) ranks better than `/album/[id]`. Add 301 redirects from old IDs. This is the biggest single SEO win but has the most engineering cost — can defer to Phase 2

**Traffic expectations:**
- Months 1-3: 50-200 visits/mo (indexing phase)
- Months 3-6: 500-2,000 visits/mo (long-tail rankings begin)
- Months 6-12: 2,000-10,000 visits/mo (topical authority builds)

### Social Media Setup

**Platforms (in priority order):**
1. **X/Twitter** — Album discourse is most active here. Music Twitter is real
2. **Threads** — Growing fast, less noise than X, Meta's algo favors new accounts
3. **Bluesky** — Indie/alt music community migrated here. Lower volume but higher engagement
4. **Instagram** — Good for visual album art content but low link click-through. Use for brand, not traffic

**Automation stack (~$15-25/mo):**
- Buffer free tier (3 channels, 10 scheduled posts) for scheduling
- n8n self-hosted on Railway ($5/mo) for automated Album of the Day posts
- Claude API (~$10/mo) to generate daily album art + summary cards
- Flow: Cron trigger at 9am EST → fetch Album of the Day from your API → Claude generates caption → Buffer publishes to X/Threads/Bluesky

**Content calendar:**
- Daily: Album of the Day post (automated)
- 3x/week: Genre spotlight, "albums like X", decade deep-dive (manual but templated)
- Weekly: Thread/carousel of "5 albums that defined [genre/year]"

**Realistic growth:** 100-300 X followers in months 1-2. 1,000-3,000 by month 6.

---

## Phase 2: Community Seeding (Weeks 3-6)

### Reddit — Highest-Intent Channel

**Target subreddits (ranked):**
| Subreddit | Members | Strategy |
|-----------|---------|----------|
| r/LetsTalkMusic | 555K | Deep album analysis posts. Your data enables unique content ("Which decade produced the most landmark albums?") |
| r/indieheads | 2.3M | Genre-specific discussions, album recommendation threads |
| r/hiphopheads | 3M | Hip-hop segment of your collection |
| r/listentothis | 18M | Share obscure albums from your Notable tier |
| r/vinyl | 1.2M | Overlap with affiliate commerce audience |

**Rules of engagement:**
- 9:1 content-to-promotion ratio (Reddit enforced)
- 4 weeks of genuine participation before ANY promotional post
- Data-driven content posts outperform link drops 8x
- Never say "check out my app" — say "I built a database of 1,173 albums and found that..."
- Best post format: "I analyzed X albums and here's what I found" with a chart/table, link to your site in comments

### Discord Communities

**Join and participate (2-week warmup before mentioning your platform):**
- Sound Garden (music discovery focused)
- JBR Community (artists + listeners)
- Genre-specific servers (search DISBOARD for "music-discussion")

**Consider launching your own Discord** — a "Music Museum" server for album discussion. Highest retention channel; converts lurkers into power users.

### Music Forums

- Sputnikmusic — album review community, receptive to new tools
- Bandcamp community — indie-focused, overlaps with your catalog
- Head-Fi — audiophile crossover audience

---

## Phase 3: Launch Spike (Weeks 5-8)

### Product Hunt Launch

**Preparation:**
1. Launch on BetaList first to build a 200-500 person waitlist
2. Be active on Product Hunt for 2-3 weeks before launch (upvote, comment on music products)
3. Create a narrated demo video (40% higher ranking)
4. Launch on a weekend to avoid competing with big companies
5. Prepare a "maker comment" with your story and the thesis

**Positioning:** "A virtual museum of album art — Letterboxd for music lovers." Lead with the visual/cultural angle, not the tech.

### Influencer Outreach

**Tier 1 — YouTube music reviewers (50K-500K subs):**
- ARTV (alt/rock/metal)
- Dead End Hip Hop (hip-hop panel reviews)
- Brad Taste in Music
- Derrick Gee (emerging artist spotlights)

**Tier 2 — TikTok/Instagram creators:**
- Search #albumreview, #newmusic2026
- Target creators who do album tier lists, "rate my collection" formats

**Outreach approach:**
- Warm up first: engage with their content for 1-2 weeks (comment, share)
- DM on Instagram (24-32% response rate vs. 3-5% for cold email)
- Lead with value: "I built this because I wanted a better way to explore album art — thought your audience might find it interesting"
- Offer: early access, co-curate a "room" on the platform, feature their picks
- Expected response rate: 10-25% cold, 30-50% warm

### Newsletter Cross-Promotion

**Music Substacks to approach:**
- Ted Gioia (Honest Broker) — massive reach, cultural criticism
- First Floor — electronic music
- The Wax Museum — smaller but engaged
- No Expectations (Josh Terry)

**Tactic:** Offer to write a guest post or provide them an exclusive "curator's room" to feature in a "tools I use" roundup. Substack's recommendation system means one writer recommending you funnels their readers directly.

---

## Phase 4: Content Flywheel (Months 2-4)

### Editorial Content Layer

Album pages capture `"[album] review"` queries. To unlock higher-volume queries, add editorial content:

1. **"Best [genre] albums of [decade]"** listicles (52 genres x 7 decades = 364 potential pages)
2. **"Albums like [popular album]"** recommendation posts (your RelatedAlbums data powers this)
3. **"History of [genre]"** pillar content for each genre cluster
4. **"[Album A] vs [Album B]"** comparison content (earns 25.7% more AI citations)

Start with 5-10 strategic posts, each linking to 5-10 album pages. This hub-and-spoke model builds topical authority fastest.

### Heatseekers Newsletter

Launch a weekly email:
- 1 album deep-dive (from your Landmark tier)
- 3 underground picks (Notable tier)
- Automated Album of the Day recap

**Free tier** drives platform traffic. At 1,000 subscribers with 40%+ open rates, sponsors engage. Music audiences are high-intent; niche sponsors (audio brands, vinyl shops, festivals) pay $35-75 CPM.

**Revenue math at 2,500 subscribers:**
- Sponsorships at 50% open rate, $40 CPM = ~$500/mo
- 100 paid subscribers at $5/mo = ~$450/mo
- Total: ~$700-950/mo

---

## Phase 5: Monetization Activation (Months 3-6)

### Premium Membership ($5/mo or $40/yr)

Introduce once you have 1,000+ registered users. Behind the paywall:
- Taste profile & yearly listening stats (the Letterboxd Wrapped equivalent — this is what drives Pro conversion)
- Spotify/Last.fm import
- Advanced collection management
- Ad-free experience

**Target:** 400 paying users = $2K MRR. At 2-4% free-to-paid conversion, you need 10,000-20,000 registered users.

### Affiliate Commerce (Already Live)

Amazon Associates tag `musicmuseum-20` is active. 180-day window to get 3 qualifying sales (deadline: ~November 19, 2026). The SEO and social media work drives traffic → album pages → Amazon clicks.

**Optimization:** Add vinyl turntable recommendations (a $250 turntable at 3-4% commission = $7.50-10 per sale, 5x more than a $30 vinyl at 5%).

---

## Metrics Dashboard

Track these weekly once analytics is set up:

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Monthly visitors | 200-500 | 1,000-3,000 | 5,000-15,000 |
| Registered users | 50-150 | 500-1,500 | 3,000-8,000 |
| X/Twitter followers | 100-300 | 500-1,000 | 1,500-3,000 |
| Newsletter subscribers | 50-200 | 500-1,000 | 1,500-3,000 |
| Amazon affiliate clicks | 20-50 | 100-300 | 500-1,500 |
| MRR | $0-10 | $50-200 | $500-1,500 |

---

## Immediate Action Items (This Week)

1. **Ship analytics** — Plausible or PostHog. Can't measure growth without it
2. **Ship share buttons** — On album pages and rooms. This is the #1 virality lever
3. **Add sitemap.xml** — `app/sitemap.ts` in Next.js, submit to Google Search Console
4. **Add JSON-LD structured data** — MusicAlbum schema on album pages
5. **Create X/Twitter account** — Start posting Album of the Day manually while building automation
6. **Join r/LetsTalkMusic** — Begin 4-week warmup period with genuine participation

## Week 2-3 Actions

7. **Set up Buffer + n8n automation** for daily Album of the Day posts
8. **Create Discord server** for early community
9. **Submit to BetaList** to build waitlist
10. **Start engaging with 5-10 music YouTubers/TikTokers** (warm-up before DM outreach)
11. **Write first 3 editorial posts** ("Best [genre] albums of [decade]" format)

## Month 2 Actions

12. **Launch on Product Hunt** (after BetaList waitlist is 200+)
13. **DM outreach to music influencers** (warm contacts from week 2-3)
14. **Email 3 music Substack writers** offering early access
15. **Launch Heatseekers newsletter** (weekly cadence)

---

## Key Insight from Research

Musicboard grew to 400K users with zero paid marketing. Their growth engine was **shareable review cards posted to social media.** The platform itself was secondary — the sharing mechanic was primary. Music Museum's equivalent: shareable album cards, room collections, and taste profiles that users want to post. Every GTM dollar should amplify sharing, not replace it.

The path to $2K MRR is not one feature — it's a flywheel: SEO drives organic traffic → social sharing drives virality → newsletter builds a direct audience → premium membership captures value → affiliate commerce monetizes passively. All five spin together.
