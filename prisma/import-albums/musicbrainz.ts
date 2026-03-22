import { getCached, setCache } from "./cache.js";

const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = "MusicMuseum/1.0 (music-museum-app)";

export interface MusicBrainzResult {
  mbid: string | null;
  title: string;
  artist: string;
  releaseYear: number | null;
  rating: number | null; // 0-5 scale
  tags: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMusicBrainz(
  artist: string,
  title: string
): Promise<MusicBrainzResult> {
  const cached = await getCached<MusicBrainzResult>("musicbrainz", artist, title);
  if (cached) return cached;

  await sleep(1100); // Rate limit: 1 req/sec

  const query = `releasegroup:"${title}" AND artist:"${artist}"`;
  const url = `${BASE_URL}/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=3`;

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

      // Find best match - prefer albums over other types
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

  await setCache("musicbrainz", artist, title, result);
  return result;
}
