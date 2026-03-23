import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DELAY_MS = 3000; // 3 seconds between requests (~20/min)

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchItunesCover(
  title: string,
  artist: string
): Promise<string | null> {
  const query = encodeURIComponent(`${artist} ${title}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=album&limit=3`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    // Try to find best match - prefer exact-ish title match
    const titleLower = title.toLowerCase();
    const match =
      data.results.find((r: Record<string, string>) =>
        r.collectionName?.toLowerCase().includes(titleLower)
      ) || data.results[0];

    // Get artwork URL and upscale to 600x600
    const artworkUrl = match.artworkUrl100;
    if (!artworkUrl) return null;

    return artworkUrl.replace("100x100bb", "600x600bb");
  } catch {
    return null;
  }
}

async function main() {
  console.log("Fetching album covers from iTunes...\n");

  const albums = await prisma.album.findMany({
    select: { id: true, title: true, artistName: true, coverUrl: true },
    orderBy: { id: "asc" },
  });

  console.log(`Found ${albums.length} albums to process.\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];

    // Skip if already has a real cover (not placeholder)
    if (album.coverUrl && !album.coverUrl.includes("placehold")) {
      skipped++;
      continue;
    }

    const coverUrl = await fetchItunesCover(album.title, album.artistName);

    if (coverUrl) {
      await prisma.album.update({
        where: { id: album.id },
        data: { coverUrl },
      });
      updated++;
      console.log(
        `[${i + 1}/${albums.length}] ✓ ${album.title} — ${album.artistName}`
      );
    } else {
      failed++;
      console.log(
        `[${i + 1}/${albums.length}] ✗ No match: ${album.title} — ${album.artistName}`
      );
    }

    // Progress summary every 25 albums
    if ((i + 1) % 25 === 0) {
      console.log(
        `\n--- Progress: ${i + 1}/${albums.length} | Updated: ${updated} | Failed: ${failed} | Skipped: ${skipped} ---\n`
      );
    }

    // Throttle to stay under rate limit
    if (i < albums.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total:   ${albums.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
