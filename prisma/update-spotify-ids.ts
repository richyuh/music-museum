import dotenv from "dotenv";
dotenv.config({ override: true });
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { albums } from "./data/albums.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Updating Spotify IDs in linksJson...\n");

  let updated = 0;
  let skipped = 0;

  for (const album of albums) {
    const spotifyId = (album.links as Record<string, string | undefined>).spotifyId;
    if (!spotifyId) {
      skipped++;
      continue;
    }

    // Find matching album by title + artist
    const existing = await prisma.album.findFirst({
      where: {
        title: album.title,
        artistName: album.artistName,
      },
    });

    if (!existing) {
      skipped++;
      continue;
    }

    // Merge spotifyId into existing linksJson
    let links: Record<string, string> = {};
    try {
      links = JSON.parse(existing.linksJson);
    } catch {}

    links.spotifyId = spotifyId;
    links.spotify = `https://open.spotify.com/album/${spotifyId}`;

    await prisma.album.update({
      where: { id: existing.id },
      data: { linksJson: JSON.stringify(links) },
    });

    updated++;
    if (updated % 100 === 0) {
      console.log(`  Updated ${updated} albums...`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
