import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, ".cache");

function normalizeKey(artist: string, title: string): string {
  return `${artist}--${title}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "_")
    .slice(0, 200);
}

export async function getCached<T>(
  prefix: string,
  artist: string,
  title: string
): Promise<T | null> {
  const filePath = path.join(CACHE_DIR, prefix, `${normalizeKey(artist, title)}.json`);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  prefix: string,
  artist: string,
  title: string,
  data: unknown
): Promise<void> {
  const dir = path.join(CACHE_DIR, prefix);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${normalizeKey(artist, title)}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
