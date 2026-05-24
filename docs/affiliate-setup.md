# Affiliate Commerce Setup

## Overview

Music Museum displays affiliate "Buy on Vinyl" and "Buy on Amazon" links on every album detail page. When a visitor clicks a link and makes a purchase, Music Museum earns a referral commission. Links only appear when the corresponding environment variables are set.

## Configuration

Add these to your `.env` file:

```bash
MERCHBAR_AFFILIATE_ID=your-merchbar-id
AMAZON_ASSOCIATE_TAG=your-amazon-tag-20
```

Both are optional. If neither is set, no affiliate links render. If only one is set, only that link appears.

Restart the dev server after changing `.env` values.

## Supported Networks

### Merchbar

- **Sign up:** https://www.merchbar.com/affiliate
- **Commission:** 5% per sale
- **Cookie window:** 7 days
- **Average order value:** $50+
- **What they sell:** Official artist merch, vinyl, apparel, posters

### Amazon Associates

- **Sign up:** https://affiliate-program.amazon.com
- **Commission:** 1-5% depending on category (vinyl/CDs = 5%, electronics = 3-4%)
- **Cookie window:** 24 hours
- **Notes:** If a visitor buys anything on Amazon within 24 hours of clicking your link, you earn commission — not just the linked product

## How It Works

Links are constructed dynamically at render time from the album's artist name and title. No database changes or re-seeding is required.

```
Album page loads
  → Server reads MERCHBAR_AFFILIATE_ID and AMAZON_ASSOCIATE_TAG from env
  → buildAffiliateLinks() constructs URLs from artist + title + affiliate tag
  → AffiliateLinks component renders buttons (or nothing if no tags set)
```

The affiliate tags are read server-side only and never appear in client-side JavaScript.

### URL Patterns

- **Merchbar:** `https://www.merchbar.com/search?q={artist}+{album}&affiliate_id={id}`
- **Amazon:** `https://www.amazon.com/s?k={artist}+{album}+vinyl&tag={tag}`

## Adding New Affiliate Networks

To add a new network, edit `src/lib/affiliate.ts`:

1. Add a new optional field to `AffiliateConfig`
2. Add a new env var in `getAffiliateConfig()`
3. Add a new `if` block in `buildAffiliateLinks()` that pushes a link to the array
4. Add the env var to `.env.example`
5. Add a test case in `src/lib/__tests__/affiliate.test.ts`

## FTC Disclosure

US law requires affiliate relationships to be disclosed to visitors. Consider adding a small disclosure on your site footer or album pages, such as:

> "Some links on this site are affiliate links. We may earn a commission if you make a purchase."

## Troubleshooting

**Links not appearing:**
- Verify `MERCHBAR_AFFILIATE_ID` and/or `AMAZON_ASSOCIATE_TAG` are set in `.env`
- Restart the dev server — Next.js does not hot-reload `.env` changes
- Check that the variables do NOT have a `NEXT_PUBLIC_` prefix (they are server-side only)

**Links appear but affiliate tracking doesn't work:**
- Verify your affiliate account is active and approved
- Check the affiliate ID/tag matches exactly what the network assigned you
- Amazon Associates requires 3 qualifying sales within 180 days of signup or the account is closed
