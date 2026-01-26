import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const roomId = parseInt(id);
  const { albumId } = await req.json();

  // Verify room belongs to user
  const room = await prisma.userRoom.findFirst({
    where: { id: roomId, userId: session.user.id },
    include: { _count: { select: { albums: true } } },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await prisma.userRoomAlbum.upsert({
    where: {
      roomId_albumId: { roomId, albumId: parseInt(albumId) },
    },
    create: {
      roomId,
      albumId: parseInt(albumId),
      position: room._count.albums,
    },
    update: {},
  });

  return NextResponse.json({ added: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const roomId = parseInt(id);
  const { albumId } = await req.json();

  // Verify room belongs to user
  const room = await prisma.userRoom.findFirst({
    where: { id: roomId, userId: session.user.id },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await prisma.userRoomAlbum.deleteMany({
    where: { roomId, albumId: parseInt(albumId) },
  });

  return NextResponse.json({ removed: true });
}
