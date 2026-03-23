import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { albums } from "../data/albums.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALBUMS_FILE = path.join(__dirname, "../data/albums.ts");
const DELAY_MS = 3000;

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

    const titleLower = title.toLowerCase();
    const match =
      data.results.find((r: Record<string, string>) =>
        r.collectionName?.toLowerCase().includes(titleLower)
      ) || data.results[0];

    const artworkUrl = match.artworkUrl100;
    if (!artworkUrl) return null;

    return artworkUrl.replace("100x100bb", "600x600bb");
  } catch {
    return null;
  }
}

async function main() {
  const lines = fs.readFileSync(ALBUMS_FILE, "utf-8").split("\n");

  console.log(`Processing ${albums.length} albums...\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];

    if (album.coverUrl) continue;

    await sleep(DELAY_MS);

    const coverUrl = await fetchItunesCover(album.title, album.artistName);

    if (!coverUrl) {
      failed++;
      console.log(`  ✗ No iTunes result: ${album.title} — ${album.artistName}`);
      if ((i + 1) % 25 === 0) {
        console.log(`  ${i + 1}/${albums.length} processed (${updated} covers, ${failed} failed)`);
      }
      continue;
    }

    // Find the line containing this album by mbid (unique identifier)
    const lineIdx = album.mbid
      ? lines.findIndex((l) => l.includes(`"${album.mbid}"`))
      : -1;

    if (lineIdx === -1) {
      failed++;
      console.log(`  ✗ Line not found: ${album.title} — ${album.artistName}`);
    } else {
      const line = lines[lineIdx];
      // Line ends with: , "mbid-uuid"),
      // Replace with: , "mbid-uuid", "coverUrl"),
      const newLine = line.replace(
        `"${album.mbid}")`,
        `"${album.mbid}", "${coverUrl}")`,
      );
      if (newLine !== line) {
        lines[lineIdx] = newLine;
        updated++;
      } else {
        failed++;
        console.log(`  ✗ Could not patch: ${album.title} — ${album.artistName}`);
      }
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  ${i + 1}/${albums.length} processed (${updated} covers, ${failed} failed)`);
    }
  }

  fs.writeFileSync(ALBUMS_FILE, lines.join("\n"));
  console.log(`\nDone. Baked ${updated} covers, ${failed} failed.`);
}

main().catch(console.error);
