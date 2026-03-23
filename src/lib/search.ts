import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export async function searchAlbums(query: string, limit = 20) {
  if (!query || query.length < 2) return [];

  // Try PostgreSQL full-text search first
  try {
    const sanitized = query.replace(/[^\w\s'-]/g, "").trim();
    const tsQuery = sanitized
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word}:*`)
      .join(" & ");

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
       FROM albums a
       WHERE to_tsvector('english', a.title || ' ' || a.artist_name) @@ to_tsquery('english', ${tsQuery})
       ORDER BY ts_rank(to_tsvector('english', a.title || ' ' || a.artist_name), to_tsquery('english', ${tsQuery})) DESC
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
    // Fallback to ILIKE queries if full-text search fails
    const results = await prisma.album.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { artistName: { contains: query, mode: "insensitive" } },
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
