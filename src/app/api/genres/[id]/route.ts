import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

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
        skip: (page - 1) * limit,
        take: limit,
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
