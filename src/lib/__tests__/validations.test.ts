import { describe, it, expect } from "vitest";
import {
  albumCreateSchema,
  albumQuerySchema,
  searchQuerySchema,
  roomCreateSchema,
  signupSchema,
  albumIdBodySchema,
} from "@/lib/validations";

describe("albumCreateSchema", () => {
  const validInput = {
    title: "OK Computer",
    artistName: "Radiohead",
    releaseYear: 1997,
  };

  it("accepts valid input", () => {
    const result = albumCreateSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = albumCreateSchema.safeParse({
      ...validInput,
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects releaseYear out of range (too low)", () => {
    const result = albumCreateSchema.safeParse({
      ...validInput,
      releaseYear: 1800,
    });
    expect(result.success).toBe(false);
  });

  it("rejects releaseYear out of range (too high)", () => {
    const result = albumCreateSchema.safeParse({
      ...validInput,
      releaseYear: 2200,
    });
    expect(result.success).toBe(false);
  });

  it("coerces releaseYear from string to number", () => {
    const result = albumCreateSchema.safeParse({
      ...validInput,
      releaseYear: "1997",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.releaseYear).toBe(1997);
    }
  });
});

describe("albumQuerySchema", () => {
  it("provides defaults for empty input", () => {
    const result = albumQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(60);
      expect(result.data.sort).toBe("impact-desc");
    }
  });

  it("rejects invalid page (less than 1)", () => {
    const result = albumQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid limit (greater than 100)", () => {
    const result = albumQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe("searchQuerySchema", () => {
  it("rejects empty string", () => {
    const result = searchQuerySchema.safeParse({ q: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid search string", () => {
    const result = searchQuerySchema.safeParse({ q: "Beatles" });
    expect(result.success).toBe(true);
  });
});

describe("roomCreateSchema", () => {
  it("accepts valid input", () => {
    const result = roomCreateSchema.safeParse({ name: "My Room" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = roomCreateSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 200 characters", () => {
    const result = roomCreateSchema.safeParse({ name: "a".repeat(201) });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("accepts valid input", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });
});

describe("albumIdBodySchema", () => {
  it("accepts positive number", () => {
    const result = albumIdBodySchema.safeParse({ albumId: 42 });
    expect(result.success).toBe(true);
  });

  it("rejects negative number", () => {
    const result = albumIdBodySchema.safeParse({ albumId: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string to number", () => {
    const result = albumIdBodySchema.safeParse({ albumId: "7" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.albumId).toBe(7);
    }
  });
});
