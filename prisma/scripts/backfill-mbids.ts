import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { albums } from "../data/albums.js";
import { setCache } from "../import-albums/cache.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALBUMS_FILE = path.join(__dirname, "../data/albums.ts");
const CAA_CACHE_DIR = path.join(__dirname, "../import-albums/.cache/caa");

const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = "MusicMuseum/1.0 (music-museum-app)";

interface MusicBrainzResult {
  mbid: string | null;
  title: string;
  artist: string;
  releaseYear: number | null;
  rating: number | null;
  tags: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function getCleanedVariants(title: string): string[] {
  const variants: string[] = [];

  const noParens = title.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (noParens !== title && noParens.length > 0) variants.push(noParens);

  const noEP = title.replace(/\s*-?\s*EP$/i, "").trim();
  if (noEP !== title && noEP.length > 0 && !variants.includes(noEP))
    variants.push(noEP);

  const noSubtitle = title.replace(/\s*:\s+.*$/, "").trim();
  if (noSubtitle !== title && noSubtitle.length > 1 && !variants.includes(noSubtitle))
    variants.push(noSubtitle);

  // For titles with both parens AND colon, try stripping parens from the colon-stripped version
  if (noSubtitle !== title) {
    const noSubtitleNoParens = noSubtitle.replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (noSubtitleNoParens !== noSubtitle && noSubtitleNoParens.length > 0 && !variants.includes(noSubtitleNoParens))
      variants.push(noSubtitleNoParens);
  }

  return variants;
}

async function fetchMusicBrainzDirect(
  title: string,
  artist: string,
): Promise<MusicBrainzResult> {
  await sleep(1100);

  const query = `releasegroup:"${title}" AND artist:"${artist}"`;
  const url = `${BASE_URL}/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

  let result: MusicBrainzResult = {
    mbid: null,
    title,
    artist,
    releaseYear: null,
    rating: null,
    tags: [],
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });

      if (res.status === 429 || res.status === 503) {
        await sleep(2000 * (attempt + 1));
        continue;
      }

      if (!res.ok) break;

      const data = await res.json();
      const groups = data["release-groups"];
      if (!groups || groups.length === 0) break;

      const match =
        groups.find(
          (g: Record<string, unknown>) =>
            g["primary-type"] === "Album" || g["primary-type"] === "album"
        ) || groups[0];

      result = {
        mbid: match.id || null,
        title: match.title || title,
        artist,
        releaseYear: match["first-release-date"]
          ? parseInt(String(match["first-release-date"]).slice(0, 4), 10)
          : null,
        rating: match.rating?.value ?? null,
        tags: (match.tags || [])
          .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
          .slice(0, 10)
          .map((t: { name: string }) => t.name.toLowerCase()),
      };
      break;
    } catch {
      if (attempt < 2) await sleep(2000 * (attempt + 1));
    }
  }

  return result;
}

function findAlbumLine(lines: string[], title: string, artistName: string): number {
  const escapedTitle = escapeString(title);
  const escapedArtist = escapeString(artistName);
  const pattern = `a("${escapedTitle}","${escapedArtist}"`;
  return lines.findIndex((l) => l.includes(pattern));
}

function patchLine(
  line: string,
  mbid: string,
  newYear: number | null,
  escapedArtist: string,
): string {
  let patched = line;

  // Fix year: only when current year is 2000 (the failure default) and MB returned a real year
  if (newYear && newYear !== 2000) {
    patched = patched.replace(
      `"${escapedArtist}",2000,[`,
      `"${escapedArtist}",${newYear},[`,
    );
  }

  // Add mbid before the closing parenthesis
  // No-mbid lines end with: ...summary"),
  patched = patched.replace(/"\),\s*$/, `", "${mbid}"),`);

  return patched;
}

async function clearStaleCAACache(mbids: string[]): Promise<number> {
  let cleared = 0;
  for (const mbid of mbids) {
    const cacheFile = path.join(CAA_CACHE_DIR, `${mbid}--${mbid}.json`);
    try {
      const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
      if (data.coverUrl === null) {
        fs.unlinkSync(cacheFile);
        cleared++;
      }
    } catch {
      // No cache file — nothing to clear
    }
  }
  return cleared;
}

async function main() {
  const lines = fs.readFileSync(ALBUMS_FILE, "utf-8").split("\n");
  const noMbidAlbums = albums.filter((a) => !a.mbid);
  const mbidNoCover = albums.filter((a) => a.mbid && !a.coverUrl);

  console.log(`Found ${noMbidAlbums.length} albums without mbid`);
  console.log(`Found ${mbidNoCover.length} albums with mbid but no cover\n`);

  let found = 0;
  let missed = 0;
  let failed = 0;

  for (let i = 0; i < noMbidAlbums.length; i++) {
    const album = noMbidAlbums[i];

    // Build list of query variants to try
    const variants = getCleanedVariants(album.title);

    let result: MusicBrainzResult | null = null;

    // Try cleaned variants first (these use different cache keys, so fetchMusicBrainzDirect will query fresh)
    for (const cleanedTitle of variants) {
      const mbResult = await fetchMusicBrainzDirect(cleanedTitle, album.artistName);
      if (mbResult.mbid) {
        result = mbResult;
        // Cache under the cleaned title key
        await setCache("musicbrainz", album.artistName, cleanedTitle, mbResult);
        break;
      }
      // Cache the miss too so we don't retry this variant
      await setCache("musicbrainz", album.artistName, cleanedTitle, mbResult);
    }

    // If no cleaned variant worked, retry the original title (bypass stale cache)
    if (!result) {
      const mbResult = await fetchMusicBrainzDirect(album.title, album.artistName);
      if (mbResult.mbid) {
        result = mbResult;
      }
    }

    if (!result || !result.mbid) {
      missed++;
      console.log(`  MISS: ${album.title} — ${album.artistName}`);
      if ((i + 1) % 25 === 0) {
        console.log(`  --- ${i + 1}/${noMbidAlbums.length} processed (${found} found, ${missed} missed, ${failed} failed)\n`);
      }
      continue;
    }

    // Cache under original title key so future re-imports find it
    await setCache("musicbrainz", album.artistName, album.title, result);

    // Patch the line in albums.ts
    const lineIdx = findAlbumLine(lines, album.title, album.artistName);
    if (lineIdx === -1) {
      failed++;
      console.log(`  FAIL: ${album.title} — ${album.artistName} (line not found in albums.ts)`);
    } else {
      const escapedArtist = escapeString(album.artistName);
      const patched = patchLine(lines[lineIdx], result.mbid, result.releaseYear, escapedArtist);
      if (patched !== lines[lineIdx]) {
        lines[lineIdx] = patched;
        found++;
        const yearInfo = result.releaseYear && result.releaseYear !== 2000
          ? `, year: ${result.releaseYear}`
          : "";
        console.log(`  FOUND: ${album.title} — ${album.artistName} → ${result.mbid}${yearInfo}`);
      } else {
        failed++;
        console.log(`  FAIL: ${album.title} — ${album.artistName} (patch did not change line)`);
      }
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  --- ${i + 1}/${noMbidAlbums.length} processed (${found} found, ${missed} missed, ${failed} failed)\n`);
    }
  }

  // Write updated albums.ts atomically
  const tmpFile = ALBUMS_FILE + ".tmp";
  fs.writeFileSync(tmpFile, lines.join("\n"));
  fs.renameSync(tmpFile, ALBUMS_FILE);

  // Clear stale CAA cache for mbid-but-no-cover albums
  const staleMbids = mbidNoCover.map((a) => a.mbid!);
  const cleared = await clearStaleCAACache(staleMbids);

  console.log(`\nDone.`);
  console.log(`  MBIDs found: ${found}`);
  console.log(`  Missed: ${missed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Stale CAA cache cleared: ${cleared} of ${staleMbids.length}`);
  console.log(`\nNext step: npx tsx prisma/scripts/bake-covers.ts`);
}

main().catch(console.error);
