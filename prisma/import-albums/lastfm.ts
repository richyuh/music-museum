import { getCached, setCache } from "./cache.js";

const BASE_URL = "http://ws.audioscrobbler.com/2.0/";

export interface LastfmResult {
  listeners: number;
  playcount: number;
  summary: string | null;
  tags: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(html: string): string {
  return html
    .replace(/<a\b[^>]*>.*?<\/a>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchLastfm(
  artist: string,
  title: string
): Promise<LastfmResult> {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) throw new Error("LASTFM_API_KEY env var is required");

  const cached = await getCached<LastfmResult>("lastfm", artist, title);
  if (cached) return cached;

  await sleep(1100); // Rate limit

  const params = new URLSearchParams({
    method: "album.getinfo",
    api_key: apiKey,
    artist,
    album: title,
    format: "json",
  });

  let result: LastfmResult = {
    listeners: 0,
    playcount: 0,
    summary: null,
    tags: [],
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}?${params}`);

      if (res.status === 429) {
        await sleep(2000 * (attempt + 1));
        continue;
      }

      if (!res.ok) break;

      const data = await res.json();
      if (data.error || !data.album) break;

      const album = data.album;
      let summary: string | null = null;
      if (album.wiki?.content) {
        summary = stripHtml(album.wiki.content);
        if (summary.length < 10) summary = null;
      }

      result = {
        listeners: parseInt(album.listeners || "0", 10),
        playcount: parseInt(album.playcount || "0", 10),
        summary,
        tags: (album.tags?.tag || [])
          .map((t: { name: string }) => t.name.toLowerCase()),
      };
      break;
    } catch {
      if (attempt < 2) await sleep(2000 * (attempt + 1));
    }
  }

  await setCache("lastfm", artist, title, result);
  return result;
}
