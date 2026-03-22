import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, apiError, apiSuccess } from "@/lib/api-utils";
import { roomCreateSchema } from "@/lib/validations";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
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

  return apiSuccess(rooms);
});

export const POST = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const body = await req.json();
  const result = roomCreateSchema.safeParse(body);
  if (!result.success) {
    return apiError("Invalid input", 400, result.error.flatten());
  }

  const { name, description } = result.data;

  const room = await prisma.userRoom.create({
    data: {
      userId: session.user.id,
      name,
      description: description || null,
    },
  });

  return apiSuccess(room, 201);
});
