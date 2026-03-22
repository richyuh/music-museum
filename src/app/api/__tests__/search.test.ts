import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockRequest } from "@/test/helpers";

// Mock the search module
const mockSearchAlbums = vi.fn();
vi.mock("@/lib/search", () => ({
  searchAlbums: (...args: unknown[]) => mockSearchAlbums(...args),
}));

import { GET } from "@/app/api/search/route";

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchAlbums.mockResolvedValue([]);
  });

  it("returns validation error when query is missing", async () => {
    const req = mockRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid search parameters");
    expect(mockSearchAlbums).not.toHaveBeenCalled();
  });

  it("calls searchAlbums for single-char query (min length is 1)", async () => {
    const req = mockRequest({ searchParams: { q: "a" } });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockSearchAlbums).toHaveBeenCalledWith("a", 50);
  });

  it("calls searchAlbums with valid query and default limit of 50", async () => {
    const results = [
      { id: 1, title: "OK Computer", artistName: "Radiohead" },
    ];
    mockSearchAlbums.mockResolvedValue(results);

    const req = mockRequest({ searchParams: { q: "radiohead" } });
    const res = await GET(req);
    const data = await res.json();

    expect(mockSearchAlbums).toHaveBeenCalledWith("radiohead", 50);
    expect(data).toEqual(results);
  });

  it("passes custom limit to searchAlbums", async () => {
    const req = mockRequest({ searchParams: { q: "test query", limit: "10" } });
    await GET(req);

    expect(mockSearchAlbums).toHaveBeenCalledWith("test query", 10);
  });

  it("rejects limit greater than 100 with validation error", async () => {
    const req = mockRequest({
      searchParams: { q: "test query", limit: "200" },
    });
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(mockSearchAlbums).not.toHaveBeenCalled();
  });

  it("handles special characters in query", async () => {
    mockSearchAlbums.mockResolvedValue([]);

    const req = mockRequest({
      searchParams: { q: "rock & roll" },
    });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockSearchAlbums).toHaveBeenCalledWith("rock & roll", 50);
    expect(data).toEqual([]);
  });
});
