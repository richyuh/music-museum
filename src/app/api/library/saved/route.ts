import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, apiError, apiSuccess } from "@/lib/api-utils";
import { albumIdBodySchema } from "@/lib/validations";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
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

  return apiSuccess(saved.map((s) => s.album));
});

export const POST = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const body = await req.json();
  const result = albumIdBodySchema.safeParse(body);
  if (!result.success) {
    return apiError("Invalid input", 400, result.error.flatten());
  }

  const { albumId } = result.data;

  // Verify album exists
  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) {
    return apiError("Album not found", 404);
  }

  await prisma.userSavedAlbum.upsert({
    where: {
      userId_albumId: {
        userId: session.user.id,
        albumId,
      },
    },
    create: {
      userId: session.user.id,
      albumId,
    },
    update: {},
  });

  return apiSuccess({ saved: true });
});

export const DELETE = withErrorHandler(async (req) => {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("Unauthorized", 401);
  }

  const body = await req.json();
  const result = albumIdBodySchema.safeParse(body);
  if (!result.success) {
    return apiError("Invalid input", 400, result.error.flatten());
  }

  const { albumId } = result.data;

  await prisma.userSavedAlbum.deleteMany({
    where: {
      userId: session.user.id,
      albumId,
    },
  });

  return apiSuccess({ saved: false });
});
