import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const genre = await prisma.genre.findFirst({
    where: {
      OR: [
        { slug: id },
        { id: isNaN(parseInt(id)) ? undefined : parseInt(id) },
      ],
    },
    include: {
      childGenres: {
        select: { id: true, name: true, slug: true, description: true, colorHex: true },
      },
      parentGenre: {
        select: { id: true, name: true, slug: true },
      },
      adjacentTo: {
        include: {
          adjacentGenre: {
            select: { id: true, name: true, slug: true, description: true, colorHex: true },
          },
        },
      },
      heroAlbums: {
        orderBy: { position: "asc" },
        include: {
          album: {
            include: {
              genres: {
                include: {
                  genre: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      },
      canonAlbums: {
        orderBy: { position: "asc" },
        include: {
          album: {
            include: {
              genres: {
                include: {
                  genre: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      },
      albums: {
        take: 100,
        include: {
          album: {
            include: {
              genres: {
                include: {
                  genre: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!genre) {
    return NextResponse.json({ error: "Genre not found" }, { status: 404 });
  }

  return NextResponse.json(genre);
}
