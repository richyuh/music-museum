import { NextRequest, NextResponse } from "next/server";
import { searchAlbums } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get("limit") || "20"));

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const results = await searchAlbums(q, limit);
  return NextResponse.json(results);
}
