import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export async function searchAlbums(query: string, limit = 20) {
  if (!query || query.length < 2) return [];

  // Try FTS5 first
  try {
    const sanitized = query.replace(/[^\w\s'-]/g, "").trim();
    const ftsQuery = sanitized
      .split(/\s+/)
      .map((word) => `"${word}"*`)
      .join(" ");

    const results = await prisma.$queryRaw<
      Array<{
        id: number;
        title: string;
        artist_name: string;
        release_year: number;
        cover_url: string;
        impact_tier: string;
        impact_score: number;
      }>
    >(
      Prisma.sql`SELECT a.id, a.title, a.artist_name, a.release_year, a.cover_url, a.impact_tier, a.impact_score
       FROM albums_fts fts
       JOIN albums a ON a.id = fts.rowid
       WHERE albums_fts MATCH ${ftsQuery}
       ORDER BY rank
       LIMIT ${limit}`
    );

    return results.map((r) => ({
      id: r.id,
      title: r.title,
      artistName: r.artist_name,
      releaseYear: r.release_year,
      coverUrl: r.cover_url,
      impactTier: r.impact_tier,
      impactScore: r.impact_score,
    }));
  } catch {
    // Fallback to LIKE queries if FTS5 is not available
    const results = await prisma.album.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { artistName: { contains: query } },
        ],
      },
      take: limit,
      orderBy: { impactScore: "desc" },
      select: {
        id: true,
        title: true,
        artistName: true,
        releaseYear: true,
        coverUrl: true,
        impactTier: true,
        impactScore: true,
      },
    });

    return results;
  }
}
