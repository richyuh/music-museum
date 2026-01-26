import { prisma } from "./prisma";

export async function getRelatedAlbums(
  albumId: number,
  genreIds: number[],
  releaseYear: number,
  limit = 12
) {
  if (genreIds.length === 0) return { sameRoom: [], adjacent: [] };

  // Get albums in the same genres, scored by overlap and year proximity
  const sameGenreAlbums = await prisma.album.findMany({
    where: {
      id: { not: albumId },
      genres: {
        some: {
          genreId: { in: genreIds },
        },
      },
    },
    include: {
      genres: {
        include: {
          genre: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    take: 50,
    orderBy: { impactScore: "desc" },
  });

  // Score and sort by relevance
  const scored = sameGenreAlbums.map((album) => {
    const sharedGenres = album.genres.filter((ag) =>
      genreIds.includes(ag.genreId)
    ).length;
    const yearDiff = Math.abs(album.releaseYear - releaseYear);
    const yearScore = Math.max(0, 10 - yearDiff / 5);
    const score = sharedGenres * 10 + yearScore;
    return { album, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const sameRoom = scored.slice(0, limit / 2).map((s) => s.album);

  // Get adjacent genre albums
  const adjacentGenreIds = await prisma.genreAdjacency.findMany({
    where: { genreId: { in: genreIds } },
    select: { adjacentGenreId: true },
  });

  const adjIds = adjacentGenreIds.map((a) => a.adjacentGenreId);
  const uniqueAdjIds = [...new Set(adjIds)].filter(
    (id) => !genreIds.includes(id)
  );

  let adjacent: typeof sameRoom = [];
  if (uniqueAdjIds.length > 0) {
    adjacent = await prisma.album.findMany({
      where: {
        id: { not: albumId },
        genres: {
          some: {
            genreId: { in: uniqueAdjIds },
          },
        },
      },
      include: {
        genres: {
          include: {
            genre: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      take: limit / 2,
      orderBy: { impactScore: "desc" },
    });
  }

  return { sameRoom, adjacent };
}
