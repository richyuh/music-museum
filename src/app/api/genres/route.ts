import { prisma } from "@/lib/prisma";
import { withErrorHandler, apiSuccess } from "@/lib/api-utils";

export const GET = withErrorHandler(async () => {
  const genres = await prisma.genre.findMany({
    where: { parentGenreId: null },
    include: {
      childGenres: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          colorHex: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return apiSuccess(genres);
});
