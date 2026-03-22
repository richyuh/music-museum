// Simple in-memory rate limiter using Map
// Key = identifier (e.g., IP + path)
// Returns { success: boolean, remaining: number }

const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - entry.count };
}
