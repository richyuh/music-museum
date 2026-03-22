import { NextRequest } from "next/server";
import { searchAlbums } from "@/lib/search";
import { withErrorHandler, apiError, apiSuccess } from "@/lib/api-utils";
import { searchQuerySchema } from "@/lib/validations";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const rawParams = Object.fromEntries(req.nextUrl.searchParams);
  const result = searchQuerySchema.safeParse(rawParams);

  if (!result.success) {
    return apiError("Invalid search parameters", 400, result.error.flatten());
  }

  const { q, limit } = result.data;
  const results = await searchAlbums(q, limit);
  return apiSuccess(results);
});
