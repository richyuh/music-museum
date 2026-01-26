import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.userSavedAlbum.findMany({
    where: { userId: session.user.id },
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
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json(saved.map((s) => s.album));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumId } = await req.json();
  if (!albumId) {
    return NextResponse.json({ error: "albumId required" }, { status: 400 });
  }

  await prisma.userSavedAlbum.upsert({
    where: {
      userId_albumId: {
        userId: session.user.id,
        albumId: parseInt(albumId),
      },
    },
    create: {
      userId: session.user.id,
      albumId: parseInt(albumId),
    },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { albumId } = await req.json();
  if (!albumId) {
    return NextResponse.json({ error: "albumId required" }, { status: 400 });
  }

  await prisma.userSavedAlbum.deleteMany({
    where: {
      userId: session.user.id,
      albumId: parseInt(albumId),
    },
  });

  return NextResponse.json({ saved: false });
}
