import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

  return NextResponse.json(genres);
}
