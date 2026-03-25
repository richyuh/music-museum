import { NextRequest, NextResponse } from "next/server";
import { getAlbumOfTheDay } from "@/lib/album-of-the-day";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/api-utils";

export const GET = withErrorHandler(async (_req: NextRequest) => {
  const album = await getAlbumOfTheDay();

  if (!album) {
    return apiError("No album of the day available", 404);
  }

  return apiSuccess({ id: album.id, title: album.title });
});
