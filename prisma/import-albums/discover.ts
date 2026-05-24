import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { candidates } from "./candidates/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "http://ws.audioscrobbler.com/2.0/";
const CACHE_DIR = path.join(__dirname, ".cache");
const DISCOVERED_PATH = path.join(CACHE_DIR, "discovered.json");

// Tags to query per genre, mapped to our genre keys
const GENRE_TAGS: Record<string, string[]> = {
  rock: ["rock", "alternative rock", "indie rock", "post-punk", "shoegaze", "progressive rock", "psychedelic rock"],
  "hip-hop": ["hip-hop", "rap", "trap", "conscious hip hop", "southern hip hop", "underground hip hop"],
  electronic: ["electronic", "ambient", "house", "techno", "idm", "trip hop", "drum and bass"],
  jazz: ["jazz", "bebop", "free jazz", "jazz fusion", "hard bop", "cool jazz"],
  "r-b-soul": ["soul", "r&b", "funk", "neo soul", "motown", "gospel"],
  pop: ["pop", "art pop", "indie pop", "synth pop", "chamber pop", "dance pop"],
  metal: ["metal", "black metal", "death metal", "doom metal", "progressive metal", "thrash metal"],
  "folk-country": ["folk", "country", "americana", "blues", "bluegrass", "world music"],
};

// Titles containing these strings are likely compilations, not studio albums
const EXCLUDE_TITLE_PATTERNS = [
  "greatest hits",
  "best of",
  "anthology",
  "collection",
  "soundtrack",
  "ost",
  "live at",
  "live in",
  "unplugged",
  "the essential",
  "the very best",
  "the complete",
  "box set",
  "deluxe edition",
  "remastered",
  "compiled",
  "singles",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Normalize for dedup: lowercase, strip "the ", collapse whitespace, normalize unicode quotes */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, "-") // em/en dashes
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupKey(artist: string, title: string): string {
  return `${normalize(artist)}|||${normalize(title)}`;
}

function isCompilation(title: string): boolean {
  const lower = title.toLowerCase();
  return EXCLUDE_TITLE_PATTERNS.some((pat) => lower.includes(pat));
}

interface DiscoveredAlbum {
  genre: string;
  artist: string;
  title: string;
}

async function fetchTagTopAlbums(
  tag: string,
  page: number,
  apiKey: string
): Promise<Array<{ artist: string; title: string }>> {
  const params = new URLSearchParams({
    method: "tag.getTopAlbums",
    tag,
    api_key: apiKey,
    format: "json",
    limit: "500",
    page: String(page),
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}?${params}`);

      if (res.status === 429) {
        console.warn(`  Rate limited on tag "${tag}" page ${page}, retrying...`);
        await sleep(2000 * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        console.warn(`  HTTP ${res.status} for tag "${tag}" page ${page}`);
        return [];
      }

      const data = await res.json();
      if (data.error || !data.albums?.album) return [];

      return data.albums.album
        .filter(
          (a: { name?: string; artist?: { name?: string } }) =>
            a.name && a.artist?.name
        )
        .map((a: { name: string; artist: { name: string } }) => ({
          artist: a.artist.name,
          title: a.name,
        }));
    } catch (err) {
      console.warn(`  Error fetching tag "${tag}" page ${page}:`, err);
      if (attempt < 2) await sleep(2000 * (attempt + 1));
    }
  }
  return [];
}

async function main() {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    console.error("Error: LASTFM_API_KEY env var is required");
    process.exit(1);
  }

  console.log("Music Museum Album Discovery\n");

  // Build set of existing candidates for dedup
  const existingKeys = new Set<string>();
  for (const [, albumList] of Object.entries(candidates)) {
    for (const { artist, title } of albumList) {
      existingKeys.add(dedupKey(artist, title));
    }
  }
  console.log(`Existing candidates: ${existingKeys.size}`);

  // Fetch top albums from Last.fm for each genre's tags
  const allDiscovered = new Map<string, DiscoveredAlbum>(); // dedupKey -> album
  const genreCounts = new Map<string, number>();
  let totalRequests = 0;

  for (const [genre, tags] of Object.entries(GENRE_TAGS)) {
    let genreNew = 0;

    for (const tag of tags) {
      for (let page = 1; page <= 2; page++) {
        await sleep(1100); // Rate limit
        totalRequests++;
        const albums = await fetchTagTopAlbums(tag, page, apiKey);

        for (const album of albums) {
          // Skip compilations
          if (isCompilation(album.title)) continue;

          const key = dedupKey(album.artist, album.title);

          // Skip if already in existing candidates
          if (existingKeys.has(key)) continue;

          // Skip if already discovered (from another tag)
          if (allDiscovered.has(key)) continue;

          allDiscovered.set(key, {
            genre,
            artist: album.artist,
            title: album.title,
          });
          genreNew++;
        }

        if (totalRequests % 10 === 0) {
          console.log(
            `  [${totalRequests} requests] Processing tag "${tag}" page ${page}...`
          );
        }
      }
    }

    genreCounts.set(genre, genreNew);
  }

  console.log(`\nDiscovery complete (${totalRequests} API requests):`);
  console.log(`  Total new unique albums: ${allDiscovered.size}`);
  for (const [genre, count] of genreCounts) {
    console.log(`  ${genre}: ${count} new`);
  }

  // Cap per genre at 250 to keep balanced
  const MAX_PER_GENRE = 250;
  const byGenre = new Map<string, DiscoveredAlbum[]>();
  for (const album of allDiscovered.values()) {
    const list = byGenre.get(album.genre) || [];
    if (list.length < MAX_PER_GENRE) {
      list.push(album);
      byGenre.set(album.genre, list);
    }
  }

  // Flatten for output
  const output: DiscoveredAlbum[] = [];
  let totalCapped = 0;
  for (const [genre, albums] of byGenre) {
    output.push(...albums);
    totalCapped += albums.length;
    console.log(`  ${genre} (capped): ${albums.length}`);
  }
  console.log(`  Total (capped): ${totalCapped}`);

  // Write JSON intermediate file
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(DISCOVERED_PATH, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${output.length} discovered albums to ${DISCOVERED_PATH}`);

  // Append to per-genre candidate files
  await appendToCandidateFiles(byGenre);

  console.log("\nDone! Next steps:");
  console.log("  1. Review the updated candidate files");
  console.log("  2. npm run import:albums");
}

async function appendToCandidateFiles(
  byGenre: Map<string, DiscoveredAlbum[]>
) {
  const genreFileMap: Record<string, { file: string; varName: string }> = {
    rock: { file: "rock.ts", varName: "rock" },
    "hip-hop": { file: "hip-hop.ts", varName: "hipHop" },
    electronic: { file: "electronic.ts", varName: "electronic" },
    jazz: { file: "jazz.ts", varName: "jazz" },
    "r-b-soul": { file: "r-b-soul.ts", varName: "rbSoul" },
    pop: { file: "pop.ts", varName: "pop" },
    metal: { file: "metal.ts", varName: "metal" },
    "folk-country": { file: "folk-country.ts", varName: "folkCountry" },
  };

  const candidatesDir = path.join(__dirname, "candidates");

  for (const [genre, albums] of byGenre) {
    if (albums.length === 0) continue;

    const info = genreFileMap[genre];
    if (!info) continue;

    const filePath = path.join(candidatesDir, info.file);
    const content = await fs.readFile(filePath, "utf-8");

    // Find the closing "];" and insert new entries before it
    const closingIndex = content.lastIndexOf("];");
    if (closingIndex === -1) {
      console.warn(`  Could not find closing ]; in ${info.file}, skipping`);
      continue;
    }

    const newEntries = albums
      .map(
        (a) =>
          `  { artist: ${JSON.stringify(a.artist)}, title: ${JSON.stringify(a.title)} },`
      )
      .join("\n");

    const updated =
      content.slice(0, closingIndex) +
      "\n  // --- Discovered via Last.fm ---\n" +
      newEntries +
      "\n" +
      content.slice(closingIndex);

    await fs.writeFile(filePath, updated);
    console.log(`  Appended ${albums.length} albums to ${info.file}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
