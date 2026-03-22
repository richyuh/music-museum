import { NextRequest, NextResponse } from "next/server";

/**
 * Consistent error response.
 */
export function apiError(
  message: string,
  status: number,
  details?: unknown
): NextResponse {
  const body: { error: string; details?: unknown } = { error: message };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

/**
 * Consistent success response.
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Safe parseInt with fallback — never returns NaN.
 */
export function safeParseInt(
  value: string | null | undefined,
  fallback: number
): number {
  if (value == null) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Type for Next.js App Router handler functions.
 * Uses `any` for context to support both parameterized and non-parameterized routes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (req: NextRequest, context: any) => Promise<NextResponse>;

/**
 * Wraps a route handler in try-catch. Returns consistent 500 on unhandled errors,
 * and 400 on malformed JSON bodies.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      // Malformed JSON body
      if (
        error instanceof SyntaxError &&
        "message" in error &&
        error.message.includes("JSON")
      ) {
        return apiError("Invalid JSON in request body", 400);
      }

      console.error(
        `[API Error] ${req.method} ${req.nextUrl.pathname}:`,
        error
      );
      return apiError("Internal server error", 500);
    }
  };
}
