import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, apiError, apiSuccess } from "@/lib/api-utils";
import { idParamSchema, roomUpdateSchema } from "@/lib/validations";

export const GET = withErrorHandler(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const idResult = idParamSchema.safeParse(parseInt(id));
  if (!idResult.success) {
    return apiError("Invalid room id", 400);
  }
  const roomId = idResult.data;

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
    return apiError("Room not found", 404);
  }

  return apiSuccess(room);
});

export const PUT = withErrorHandler(async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const idResult = idParamSchema.safeParse(parseInt(id));
  if (!idResult.success) {
    return apiError("Invalid room id", 400);
  }
  const roomId = idResult.data;

  const body = await req.json();
  const result = roomUpdateSchema.safeParse(body);
  if (!result.success) {
    return apiError("Invalid input", 400, result.error.flatten());
  }

  const { name, description } = result.data;

  const room = await prisma.userRoom.updateMany({
    where: { id: roomId, userId: session.user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  if (room.count === 0) {
    return apiError("Room not found", 404);
  }

  return apiSuccess({ updated: true });
});

export const DELETE = withErrorHandler(async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const { id } = await params;
  const idResult = idParamSchema.safeParse(parseInt(id));
  if (!idResult.success) {
    return apiError("Invalid room id", 400);
  }
  const roomId = idResult.data;

  await prisma.userRoom.deleteMany({
    where: { id: roomId, userId: session.user.id },
  });

  return apiSuccess({ deleted: true });
});
