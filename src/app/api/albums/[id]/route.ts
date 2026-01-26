import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const albumId = parseInt(id);

  if (isNaN(albumId)) {
    return NextResponse.json({ error: "Invalid album ID" }, { status: 400 });
  }

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      genres: {
        include: {
          genre: {
            select: { id: true, name: true, slug: true, colorHex: true },
          },
        },
      },
    },
  });

  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  return NextResponse.json(album);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const albumId = parseInt(id);
  const body = await req.json();

  const album = await prisma.album.update({
    where: { id: albumId },
    data: {
      title: body.title,
      artistName: body.artistName,
      releaseYear: parseInt(body.releaseYear),
      coverUrl: body.coverUrl || "",
      summary: body.summary || null,
      impactTier: body.impactTier || "Notable",
      impactScore: parseInt(body.impactScore) || 50,
      linksJson: body.linksJson || "{}",
    },
  });

  return NextResponse.json(album);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const albumId = parseInt(id);

  await prisma.album.delete({ where: { id: albumId } });
  return NextResponse.json({ deleted: true });
}
