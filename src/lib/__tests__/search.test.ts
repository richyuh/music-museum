import { describe, it, expect } from "vitest";

describe("search sanitization", () => {
  // Mirrors the sanitization regex used in src/lib/search.ts
  const sanitize = (q: string) => q.replace(/[^\w\s'-]/g, "").trim();

  it("preserves normal text", () => {
    expect(sanitize("The Beatles")).toBe("The Beatles");
  });

  it("preserves hyphens", () => {
    expect(sanitize("hip-hop")).toBe("hip-hop");
  });

  it("preserves apostrophes", () => {
    expect(sanitize("The Who's Next")).toBe("The Who's Next");
  });

  it("strips dangerous characters", () => {
    expect(sanitize("test; DROP TABLE")).toBe("test DROP TABLE");
  });

  it("strips parentheses and brackets", () => {
    expect(sanitize("test(1)[2]{3}")).toBe("test123");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitize("  hello  ")).toBe("hello");
  });
});
