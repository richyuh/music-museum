import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { albums } from "../data/albums.js";
import { getCached, setCache } from "../import-albums/cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALBUMS_FILE = path.join(__dirname, "../data/albums.ts");
const ITUNES_DELAY_MS = 3000;
const CAA_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
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

async function resolveRedirects(url: string): Promise<string> {
  const res = await fetch(url, { redirect: "manual" });
  const location = res.headers.get("location");
  if (location && (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308)) {
    return resolveRedirects(location.replace("http://", "https://"));
  }
  return url;
}

async function fetchCoverArtArchive(mbid: string): Promise<string | null> {
  const cached = await getCached<{ coverUrl: string | null }>("caa", mbid, mbid);
  if (cached !== null) return cached.coverUrl;

  const url = `https://coverartarchive.org/release-group/${mbid}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "MusicMuseum/1.0 (music-museum-app)",
        "Accept": "application/json",
      },
    });
    if (!res.ok) {
      await setCache("caa", mbid, mbid, { coverUrl: null });
      return null;
    }

    const data = await res.json();
    const front =
      data.images?.find((img: { front: boolean }) => img.front) ||
      data.images?.[0];
    if (!front) {
      await setCache("caa", mbid, mbid, { coverUrl: null });
      return null;
    }

    const raw =
      front.thumbnails?.["500"] ||
      front.thumbnails?.large ||
      front.thumbnails?.small ||
      front.image ||
      null;
    if (!raw) {
      await setCache("caa", mbid, mbid, { coverUrl: null });
      return null;
    }
    const coverUrl = await resolveRedirects(raw.replace("http://", "https://"));

    await setCache("caa", mbid, mbid, { coverUrl });
    return coverUrl;
  } catch {
    await setCache("caa", mbid, mbid, { coverUrl: null });
    return null;
  }
}

async function main() {
  const lines = fs.readFileSync(ALBUMS_FILE, "utf-8").split("\n");

  console.log(`Processing ${albums.length} albums...\n`);

  let itunesCount = 0;
  let caaCount = 0;
  let failed = 0;

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];

    if (album.coverUrl) continue;

    await sleep(ITUNES_DELAY_MS);

    let coverUrl = await fetchItunesCover(album.title, album.artistName);
    let source = "iTunes";

    if (!coverUrl && album.mbid) {
      await sleep(CAA_DELAY_MS);
      coverUrl = await fetchCoverArtArchive(album.mbid);
      source = "CAA";
    }

    if (!coverUrl) {
      failed++;
      console.log(`  FAIL:   ${album.title} — ${album.artistName}`);
      if ((i + 1) % 25 === 0) {
        console.log(`  ${i + 1}/${albums.length} processed (${itunesCount} iTunes, ${caaCount} CAA, ${failed} failed)`);
      }
      continue;
    }

    let lineIdx = -1;
    if (album.mbid) {
      lineIdx = lines.findIndex((l) => l.includes(`"${album.mbid}"`));
    }
    // If mbid matched a line that already has a cover after the mbid, try title+artist instead
    if (lineIdx !== -1 && album.mbid && !lines[lineIdx].includes(`"${album.mbid}")`)) {
      lineIdx = -1;
    }
    if (lineIdx === -1) {
      const escapedTitle = escapeString(album.title);
      const escapedArtist = escapeString(album.artistName);
      lineIdx = lines.findIndex((l) => l.includes(`a("${escapedTitle}","${escapedArtist}"`));
    }

    if (lineIdx === -1) {
      failed++;
      console.log(`  FAIL:   ${album.title} — ${album.artistName} (line not found)`);
    } else {
      const line = lines[lineIdx];
      let newLine: string;
      if (album.mbid && line.includes(`"${album.mbid}")`)) {
        newLine = line.replace(`"${album.mbid}")`, `"${album.mbid}", "${coverUrl}")`);
      } else {
        newLine = line.replace(/"\),\s*$/, `", undefined, "${coverUrl}"),`);
      }
      if (newLine !== line) {
        lines[lineIdx] = newLine;
        if (source === "iTunes") itunesCount++;
        else caaCount++;
        console.log(`  ${source.padEnd(7)} ${album.title} — ${album.artistName}`);
      } else {
        failed++;
        console.log(`  FAIL:   ${album.title} — ${album.artistName} (could not patch)`);
      }
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  ${i + 1}/${albums.length} processed (${itunesCount} iTunes, ${caaCount} CAA, ${failed} failed)`);
    }
  }

  fs.writeFileSync(ALBUMS_FILE, lines.join("\n"));
  console.log(`\nDone. Baked ${itunesCount + caaCount} covers (${itunesCount} iTunes, ${caaCount} CAA), ${failed} failed.`);
}

main().catch(console.error);
