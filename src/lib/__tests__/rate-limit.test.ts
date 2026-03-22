import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request with remaining = limit - 1", () => {
    const result = rateLimit("test-first-request", 5, 60_000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("allows requests up to the limit", () => {
    const r1 = rateLimit("test-up-to-limit", 3, 60_000);
    const r2 = rateLimit("test-up-to-limit", 3, 60_000);
    const r3 = rateLimit("test-up-to-limit", 3, 60_000);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("rejects requests beyond the limit", () => {
    rateLimit("test-beyond-limit", 2, 60_000);
    rateLimit("test-beyond-limit", 2, 60_000);
    const r3 = rateLimit("test-beyond-limit", 2, 60_000);
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("allows requests again after the window expires", () => {
    const r1 = rateLimit("test-window-expire", 1, 10_000);
    expect(r1.success).toBe(true);

    const r2 = rateLimit("test-window-expire", 1, 10_000);
    expect(r2.success).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(10_001);

    const r3 = rateLimit("test-window-expire", 1, 10_000);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("tracks different keys independently", () => {
    const r1 = rateLimit("test-key-a", 1, 60_000);
    const r2 = rateLimit("test-key-b", 1, 60_000);
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});
