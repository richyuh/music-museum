import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { albums } from "../data/albums.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALBUMS_FILE = path.join(__dirname, "../data/albums.ts");

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

// Find no-mbid albums with year != 2000 (year was changed by backfill but mbid was removed)
const toFix = albums.filter(a => !a.mbid && a.releaseYear !== 2000);
console.log(`Found ${toFix.length} no-mbid albums with changed years to revert\n`);

const lines = fs.readFileSync(ALBUMS_FILE, "utf-8").split("\n");
let fixed = 0;

for (const album of toFix) {
  const escTitle = escapeString(album.title);
  const escArtist = escapeString(album.artistName);
  const pattern = `a("${escTitle}","${escArtist}"`;
  const lineIdx = lines.findIndex(l => l.includes(pattern));
  if (lineIdx === -1) {
    console.log(`  SKIP: ${album.title} (line not found)`);
    continue;
  }
  
  const line = lines[lineIdx];
  const yearPattern = `"${escArtist}",${album.releaseYear},[`;
  if (line.includes(yearPattern)) {
    lines[lineIdx] = line.replace(yearPattern, `"${escArtist}",2000,[`);
    fixed++;
    console.log(`  FIXED: ${album.title} — ${album.artistName} (${album.releaseYear} → 2000)`);
  } else {
    console.log(`  SKIP: ${album.title} (year pattern not found)`);
  }
}

const tmpFile = ALBUMS_FILE + ".tmp";
fs.writeFileSync(tmpFile, lines.join("\n"));
fs.renameSync(tmpFile, ALBUMS_FILE);
console.log(`\nReverted ${fixed} of ${toFix.length} years.`);
