import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { withErrorHandler, apiError, apiSuccess } from "@/lib/api-utils";
import { idParamSchema, albumUpdateSchema } from "@/lib/validations";

export const GET = withErrorHandler(async (_req: NextRequest, context) => {
  const { id } = await context.params;
  const parsed = idParamSchema.safeParse(parseInt(id));

  if (!parsed.success) {
    return apiError("Invalid album ID", 400, parsed.error.flatten());
  }

  const albumId = parsed.data;

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
    return apiError("Album not found", 404);
  }

  return apiSuccess(album);
});

export const PUT = withErrorHandler(async (req: NextRequest, context) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Forbidden", 403);
  }

  const { id } = await context.params;
  const parsed = idParamSchema.safeParse(parseInt(id));

  if (!parsed.success) {
    return apiError("Invalid album ID", 400, parsed.error.flatten());
  }

  const albumId = parsed.data;

  const existing = await prisma.album.findUnique({ where: { id: albumId } });
  if (!existing) {
    return apiError("Album not found", 404);
  }

  const body = await req.json();
  const result = albumUpdateSchema.safeParse(body);

  if (!result.success) {
    return apiError("Invalid album data", 400, result.error.flatten());
  }

  const { title, artistName, releaseYear, coverUrl, summary, impactTier, impactScore, linksJson } = result.data;

  const album = await prisma.album.update({
    where: { id: albumId },
    data: {
      ...(title !== undefined && { title }),
      ...(artistName !== undefined && { artistName }),
      ...(releaseYear !== undefined && { releaseYear }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(summary !== undefined && { summary: summary || null }),
      ...(impactTier !== undefined && { impactTier }),
      ...(impactScore !== undefined && { impactScore }),
      ...(linksJson !== undefined && { linksJson }),
    },
  });

  return apiSuccess(album);
});

export const DELETE = withErrorHandler(async (_req: NextRequest, context) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Forbidden", 403);
  }

  const { id } = await context.params;
  const parsed = idParamSchema.safeParse(parseInt(id));

  if (!parsed.success) {
    return apiError("Invalid album ID", 400, parsed.error.flatten());
  }

  const albumId = parsed.data;

  const existing = await prisma.album.findUnique({ where: { id: albumId } });
  if (!existing) {
    return apiError("Album not found", 404);
  }

  await prisma.album.delete({ where: { id: albumId } });
  return apiSuccess({ deleted: true });
});
