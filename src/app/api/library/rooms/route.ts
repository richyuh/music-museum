import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rooms = await prisma.userRoom.findMany({
    where: { userId: session.user.id },
    include: {
      albums: {
        take: 4,
        orderBy: { position: "asc" },
        include: {
          album: {
            select: { id: true, coverUrl: true, title: true },
          },
        },
      },
      _count: { select: { albums: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const room = await prisma.userRoom.create({
    data: {
      userId: session.user.id,
      name,
      description: description || null,
    },
  });

  return NextResponse.json(room, { status: 201 });
}
