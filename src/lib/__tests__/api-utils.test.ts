import { describe, it, expect } from "vitest";
import { safeParseInt, apiError, apiSuccess } from "@/lib/api-utils";

describe("safeParseInt", () => {
  it("parses a valid integer string", () => {
    expect(safeParseInt("123", 0)).toBe(123);
  });

  it("returns default for non-numeric string", () => {
    expect(safeParseInt("abc", 42)).toBe(42);
  });

  it("returns default for null", () => {
    expect(safeParseInt(null, 5)).toBe(5);
  });

  it("returns default for undefined", () => {
    expect(safeParseInt(undefined, 5)).toBe(5);
  });

  it("returns default for empty string", () => {
    expect(safeParseInt("", 0)).toBe(0);
  });
});

describe("apiError", () => {
  it("returns a response with the given status and error message", async () => {
    const response = apiError("test", 400);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "test" });
  });

  it("includes details when provided", async () => {
    const response = apiError("test", 400, { field: "x" });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error: "test", details: { field: "x" } });
  });
});

describe("apiSuccess", () => {
  it("returns status 200 by default", async () => {
    const response = apiSuccess({ ok: true });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
  });

  it("returns a custom status when provided", async () => {
    const response = apiSuccess({ ok: true }, 201);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
  });
});
