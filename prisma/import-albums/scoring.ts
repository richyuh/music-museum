import type { MusicBrainzResult } from "./musicbrainz.js";
import type { LastfmResult } from "./lastfm.js";

export interface ScoredAlbum {
  title: string;
  artist: string;
  releaseYear: number;
  genres: string[];
  mbid: string | null;
  impactScore: number;
  impactTier: "Landmark" | "Essential" | "Notable";
  summary: string | null;
  listeners: number;
  playcount: number;
  spotifyAlbumId?: string | null;
}

export function computeScore(
  mb: MusicBrainzResult,
  lastfm: LastfmResult,
  releaseYear: number
): number {
  // MusicBrainz rating: 0-5 scale → 0-100
  const mbRating = (mb.rating ?? 0) * 20;

  // Last.fm listeners: log scale, normalized to 0-100
  // 20M listeners = 100 (roughly the most popular albums)
  const listenerScore =
    lastfm.listeners > 0
      ? Math.min(100, (Math.log10(lastfm.listeners) / Math.log10(20_000_000)) * 100)
      : 0;

  // Last.fm playcount: log scale, normalized to 0-100
  // 500M plays = 100
  const playScore =
    lastfm.playcount > 0
      ? Math.min(100, (Math.log10(lastfm.playcount) / Math.log10(500_000_000)) * 100)
      : 0;

  // Age bonus: older albums that are still popular are more impactful
  // Caps at 15 points (~60 years old)
  const age = 2026 - releaseYear;
  const ageBonus = Math.min(15, age / 4);

  const raw =
    mbRating * 0.25 +
    listenerScore * 0.30 +
    playScore * 0.25 +
    ageBonus * 0.20;

  return Math.round(Math.min(99, Math.max(1, raw)));
}

export function assignTiers(
  albums: Array<{ impactScore: number }>
): void {
  // Sort by score to find percentile cutoffs
  const scores = albums.map((a) => a.impactScore).sort((a, b) => b - a);
  const landmarkCutoff = scores[Math.floor(scores.length * 0.10)] || 80;
  const essentialCutoff = scores[Math.floor(scores.length * 0.35)] || 60;

  for (const album of albums as Array<{ impactScore: number; impactTier: string }>) {
    if (album.impactScore >= landmarkCutoff) {
      album.impactTier = "Landmark";
    } else if (album.impactScore >= essentialCutoff) {
      album.impactTier = "Essential";
    } else {
      album.impactTier = "Notable";
    }
  }
}
