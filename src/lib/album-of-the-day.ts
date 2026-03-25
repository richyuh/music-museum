import { prisma } from "@/lib/prisma";

function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export async function getAlbumOfTheDay() {
  const count = await prisma.album.count({
    where: { impactTier: "Landmark", summary: { not: null } },
  });

  if (count === 0) return null;

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD in UTC
  const index = hashDateString(dateStr) % count;

  const album = await prisma.album.findFirst({
    where: { impactTier: "Landmark", summary: { not: null } },
    skip: index,
    take: 1,
    orderBy: { id: "asc" },
    include: {
      genres: {
        include: {
          genre: { select: { id: true, name: true, slug: true, colorHex: true } },
        },
      },
    },
  });

  return album;
}
