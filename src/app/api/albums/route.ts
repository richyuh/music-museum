import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { withErrorHandler, apiError, apiSuccess } from "@/lib/api-utils";
import { albumQuerySchema, albumCreateSchema } from "@/lib/validations";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const rawParams = Object.fromEntries(req.nextUrl.searchParams);
  const result = albumQuerySchema.safeParse(rawParams);

  if (!result.success) {
    return apiError("Invalid query parameters", 400, result.error.flatten());
  }

  const { page, limit, genre, yearMin, yearMax, tier, sort } = result.data;

  const where: Record<string, unknown> = {};

  if (genre) {
    where.genres = {
      some: {
        genre: { slug: genre },
      },
    };
  }

  if (yearMin || yearMax) {
    where.releaseYear = {
      ...(yearMin ? { gte: yearMin } : {}),
      ...(yearMax ? { lte: yearMax } : {}),
    };
  }

  if (tier) {
    where.impactTier = tier;
  }

  const orderBy: Record<string, string> = {};
  switch (sort) {
    case "year-asc":
      orderBy.releaseYear = "asc";
      break;
    case "year-desc":
      orderBy.releaseYear = "desc";
      break;
    case "title-asc":
      orderBy.title = "asc";
      break;
    case "impact-desc":
      orderBy.impactScore = "desc";
      break;
    default:
      orderBy.impactScore = "desc";
  }

  const [albums, total] = await Promise.all([
    prisma.album.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        genres: {
          include: {
            genre: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    }),
    prisma.album.count({ where }),
  ]);

  return apiSuccess({
    albums,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return apiError("Forbidden", 403);
  }

  const body = await req.json();
  const result = albumCreateSchema.safeParse(body);

  if (!result.success) {
    return apiError("Invalid album data", 400, result.error.flatten());
  }

  const { title, artistName, releaseYear, coverUrl, summary, impactTier, impactScore, genreIds, linksJson } = result.data;

  const album = await prisma.album.create({
    data: {
      title,
      artistName,
      releaseYear,
      coverUrl: coverUrl || "",
      summary: summary || null,
      impactTier,
      impactScore,
      linksJson: linksJson || "{}",
      genres: genreIds?.length
        ? {
            create: genreIds.map((genreId: number) => ({
              genre: { connect: { id: genreId } },
            })),
          }
        : undefined,
    },
  });

  return apiSuccess(album, 201);
});
