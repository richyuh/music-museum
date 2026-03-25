import { getCached, setCache } from "./cache.js";

export interface SpotifyResult {
  spotifyAlbumId: string | null;
  spotifyUrl: string | null;
}

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function validateMatch(
  inputArtist: string,
  inputTitle: string,
  spotifyArtists: { name: string }[],
  spotifyAlbumName: string
): boolean {
  const normTitle = normalize(inputTitle);
  const normSpotifyTitle = normalize(spotifyAlbumName);

  // Title: input should be substring of Spotify title (handles remastered editions, deluxe, etc.)
  const titleMatch = normSpotifyTitle.includes(normTitle) || normTitle.includes(normSpotifyTitle);
  if (!titleMatch) return false;

  // Artist: input should match at least one of Spotify's listed artists
  const normArtist = normalize(inputArtist);
  const artistMatch = spotifyArtists.some((a) => {
    const normSpotifyArtist = normalize(a.name);
    return normSpotifyArtist.includes(normArtist) || normArtist.includes(normSpotifyArtist);
  });

  return artistMatch;
}

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars are required");
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Expire 60s early to avoid edge cases
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken!;
}

async function searchSpotify(
  query: string,
  token: string,
  artist: string,
  title: string
): Promise<SpotifyResult> {
  // Build URL manually — URLSearchParams encodes colons which breaks
  // Spotify's field filter syntax (album: and artist:)
  const url = `https://api.spotify.com/v1/search?q=${query}&type=album&limit=5`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        // Token expired — refresh and retry
        cachedToken = null;
        token = await getSpotifyToken();
        continue;
      }

      if (res.status === 429 || res.status >= 500) {
        await sleep(2000 * (attempt + 1));
        continue;
      }

      if (!res.ok) break;

      const data = await res.json();
      const items = data.albums?.items;
      if (items && items.length > 0) {
        // Find first result that passes validation
        for (const item of items) {
          if (validateMatch(artist, title, item.artists || [], item.name || "")) {
            return {
              spotifyAlbumId: item.id,
              spotifyUrl: `https://open.spotify.com/album/${item.id}`,
            };
          }
        }
      }
      break;
    } catch {
      if (attempt < 2) await sleep(2000 * (attempt + 1));
    }
  }

  return { spotifyAlbumId: null, spotifyUrl: null };
}

export async function fetchOneSpotify(
  artist: string,
  title: string,
  token: string
): Promise<SpotifyResult> {
  const cached = await getCached<SpotifyResult>("spotify", artist, title);
  if (cached) return cached;

  // Tier 1: field-filtered search (most precise)
  // Encode only the values, not the field operators (album: and artist:)
  let result = await searchSpotify(
    `album:${encodeURIComponent(title)}+artist:${encodeURIComponent(artist)}`,
    token, artist, title
  );

  // Tier 2: plain text fallback (broader)
  if (!result.spotifyAlbumId) {
    result = await searchSpotify(encodeURIComponent(`${artist} ${title}`), token, artist, title);
  }

  // Only cache positive results — allows retrying misses on future runs
  if (result.spotifyAlbumId) {
    await setCache("spotify", artist, title, result);
  }

  return result;
}

export async function fetchAllSpotify(
  candidates: { artist: string; title: string }[]
): Promise<Map<string, SpotifyResult>> {
  const token = await getSpotifyToken();
  const resultMap = new Map<string, SpotifyResult>();

  console.log(`\nFetching Spotify data for ${candidates.length} albums...`);

  const CONCURRENCY = 5;
  let completed = 0;

  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    if (i > 0) await sleep(500); // Delay between batches to stay under rate limits
    const chunk = candidates.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (c) => {
        const result = await fetchOneSpotify(c.artist, c.title, token);
        completed++;
        if (completed % 50 === 0 || completed === candidates.length) {
          console.log(`  [${completed}/${candidates.length}] Spotify lookups`);
        }
        return { artist: c.artist, title: c.title, result };
      })
    );

    for (const { artist, title, result } of results) {
      const key = `${artist.toLowerCase()}|||${title.toLowerCase()}`;
      resultMap.set(key, result);
    }
  }

  const found = Array.from(resultMap.values()).filter((r) => r.spotifyAlbumId).length;
  console.log(`  Spotify: found ${found}/${candidates.length} albums`);

  return resultMap;
}
