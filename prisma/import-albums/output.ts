import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { ScoredAlbum } from "./scoring.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parent genre slugs in display order
const PARENT_GENRES = [
  "rock",
  "hip-hop",
  "electronic",
  "jazz",
  "r-b-soul",
  "pop",
  "metal",
  "folk-country",
];

function escapeString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function getParentGenre(genres: string[]): string {
  // Find the first genre that's a parent genre
  for (const g of genres) {
    if (PARENT_GENRES.includes(g)) return g;
  }
  // Check if any genre is a subgenre of a parent
  // Default to first genre's parent or "rock"
  return genres[0] || "rock";
}

export async function generateAlbumsFile(
  albums: ScoredAlbum[]
): Promise<void> {
  // Group albums by parent genre
  const genreGroups = new Map<string, ScoredAlbum[]>();
  for (const g of PARENT_GENRES) {
    genreGroups.set(g, []);
  }

  for (const album of albums) {
    const parent = getParentGenre(album.genres);
    const group = genreGroups.get(parent);
    if (group) {
      group.push(album);
    } else {
      // If genre not in parent list, find closest parent
      const fallback = genreGroups.get("rock")!;
      fallback.push(album);
    }
  }

  // Sort each group by score descending
  for (const group of genreGroups.values()) {
    group.sort((a, b) => b.impactScore - a.impactScore);
  }

  // Build the output
  let output = `export interface AlbumSeedData {
  title: string;
  artistName: string;
  releaseYear: number;
  genres: string[];
  subgenres: string[];
  impactTier: "Landmark" | "Essential" | "Notable";
  impactScore: number;
  summary: string;
  links: { spotify?: string; apple?: string; youtube?: string };
  mbid?: string;
}

function a(title: string, artist: string, year: number, genres: string[], subgenres: string[], tier: "Landmark"|"Essential"|"Notable", score: number, summary: string, mbid?: string): AlbumSeedData {
  const q = encodeURIComponent(artist + " " + title);
  return { title, artistName: artist, releaseYear: year, genres, subgenres, impactTier: tier, impactScore: score, summary, links: { spotify: \`https://open.spotify.com/search/\${q}\`, apple: \`https://music.apple.com/us/search?term=\${q}\`, youtube: \`https://music.youtube.com/search?q=\${q}\` }, mbid };
}

export const albums: AlbumSeedData[] = [
`;

  let totalIndex = 0;
  const heroAlbums: Record<string, number[]> = {};
  const canonAlbums: Record<string, number[]> = {};

  for (const [genreSlug, group] of genreGroups) {
    const genreName = genreSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const startIdx = totalIndex;

    output += `  // ===== ${genreName.toUpperCase()} (${startIdx}-${startIdx + group.length - 1}) =====\n`;

    // Track hero and canon indices
    heroAlbums[genreSlug] = [];
    canonAlbums[genreSlug] = [];

    for (let i = 0; i < group.length; i++) {
      const album = group[i];
      const summary = escapeString(album.summary || "");
      const genresArr = JSON.stringify(album.genres);
      const mbidArg = album.mbid ? `, "${album.mbid}"` : "";

      output += `  a("${escapeString(album.title)}","${escapeString(album.artist)}",${album.releaseYear},${genresArr},[],"${album.impactTier}",${album.impactScore},"${summary}"${mbidArg}),\n`;

      // Top 12 = hero, top 24 = canon
      if (i < 12) heroAlbums[genreSlug].push(totalIndex);
      if (i < 24) canonAlbums[genreSlug].push(totalIndex);

      totalIndex++;
    }

    output += "\n";
  }

  output += `];\n\n`;

  // Generate hero albums map
  output += `export const genreHeroAlbums: Record<string, number[]> = {\n`;
  for (const [slug, indices] of Object.entries(heroAlbums)) {
    output += `  "${slug}": [${indices.join(", ")}],\n`;
  }
  output += `};\n\n`;

  // Generate canon albums map
  output += `export const genreCanonAlbums: Record<string, number[]> = {\n`;
  for (const [slug, indices] of Object.entries(canonAlbums)) {
    output += `  "${slug}": [${indices.join(", ")}],\n`;
  }
  output += `};\n`;

  const outPath = path.join(__dirname, "..", "data", "albums.ts");
  await fs.writeFile(outPath, output);
  console.log(`\nWrote ${totalIndex} albums to ${outPath}`);

  // Print distribution
  console.log("\nDistribution by genre:");
  for (const [slug, group] of genreGroups) {
    const landmarks = group.filter((a) => a.impactTier === "Landmark").length;
    const essentials = group.filter((a) => a.impactTier === "Essential").length;
    const notables = group.filter((a) => a.impactTier === "Notable").length;
    console.log(
      `  ${slug}: ${group.length} albums (${landmarks}L / ${essentials}E / ${notables}N)`
    );
  }

  const allLandmarks = albums.filter((a) => a.impactTier === "Landmark").length;
  const allEssentials = albums.filter((a) => a.impactTier === "Essential").length;
  const allNotables = albums.filter((a) => a.impactTier === "Notable").length;
  console.log(
    `\nTotal: ${totalIndex} albums (${allLandmarks} Landmark / ${allEssentials} Essential / ${allNotables} Notable)`
  );
}
