import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const roomId = parseInt(id);

  const room = await prisma.userRoom.findFirst({
    where: { id: roomId, userId: session.user.id },
    include: {
      albums: {
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
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const roomId = parseInt(id);
  const { name, description } = await req.json();

  const room = await prisma.userRoom.updateMany({
    where: { id: roomId, userId: session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  if (room.count === 0) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ updated: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const roomId = parseInt(id);

  await prisma.userRoom.deleteMany({
    where: { id: roomId, userId: session.user.id },
  });

  return NextResponse.json({ deleted: true });
}
