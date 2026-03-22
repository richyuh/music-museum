import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function middleware(req: NextRequest) {
  const start = Date.now();
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/library") && !token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  logger.info("request", {
    method: req.method,
    path: pathname,
    durationMs: Date.now() - start,
  });

  return NextResponse.next();
}

export const config = {
  matcher: ["/library/:path*", "/admin/:path*"],
};
