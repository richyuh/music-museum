import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || String(ITEMS_PER_PAGE)));
  const genre = searchParams.get("genre");
  const yearMin = searchParams.get("yearMin") ? parseInt(searchParams.get("yearMin")!) : undefined;
  const yearMax = searchParams.get("yearMax") ? parseInt(searchParams.get("yearMax")!) : undefined;
  const tier = searchParams.get("tier");
  const sort = searchParams.get("sort") || "impact-desc";

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

  return NextResponse.json({
    albums,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, artistName, releaseYear, coverUrl, summary, impactTier, impactScore, genreIds, linksJson } = body;

  if (!title || !artistName || !releaseYear) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const album = await prisma.album.create({
    data: {
      title,
      artistName,
      releaseYear: parseInt(releaseYear),
      coverUrl: coverUrl || "",
      summary: summary || null,
      impactTier: impactTier || "Notable",
      impactScore: parseInt(impactScore) || 50,
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

  return NextResponse.json(album, { status: 201 });
}
