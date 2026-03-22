import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockRequest } from "@/test/helpers";

// Mock prisma
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    album: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => mockAuth(),
}));

import { GET, POST } from "@/app/api/albums/route";

describe("GET /api/albums", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);
  });

  it("returns albums with default pagination", async () => {
    const sampleAlbums = [
      { id: 1, title: "OK Computer", artistName: "Radiohead", genres: [] },
    ];
    mockFindMany.mockResolvedValue(sampleAlbums);
    mockCount.mockResolvedValue(1);

    const req = mockRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.albums).toEqual(sampleAlbums);
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(1);
  });

  it("passes genre filter to prisma", async () => {
    const req = mockRequest({ searchParams: { genre: "rock" } });
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          genres: { some: { genre: { slug: "rock" } } },
        }),
      })
    );
  });

  it("passes year range filters", async () => {
    const req = mockRequest({
      searchParams: { yearMin: "1990", yearMax: "2000" },
    });
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          releaseYear: { gte: 1990, lte: 2000 },
        }),
      })
    );
  });

  it("passes tier filter", async () => {
    const req = mockRequest({ searchParams: { tier: "Landmark" } });
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ impactTier: "Landmark" }),
      })
    );
  });

  it("handles sort parameter", async () => {
    const req = mockRequest({ searchParams: { sort: "year-asc" } });
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { releaseYear: "asc" },
      })
    );
  });

  it("defaults sort to impact-desc", async () => {
    const req = mockRequest();
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { impactScore: "desc" },
      })
    );
  });

  it("rejects page less than 1 with validation error", async () => {
    const req = mockRequest({ searchParams: { page: "-5" } });
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid query parameters");
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("rejects limit greater than 100 with validation error", async () => {
    const req = mockRequest({ searchParams: { limit: "500" } });
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid query parameters");
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("calculates correct pagination offset", async () => {
    mockCount.mockResolvedValue(200);
    const req = mockRequest({ searchParams: { page: "3", limit: "20" } });
    const res = await GET(req);
    const data = await res.json();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 40, take: 20 })
    );
    expect(data.page).toBe(3);
    expect(data.totalPages).toBe(10);
  });
});

describe("POST /api/albums", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const req = mockRequest({
      method: "POST",
      body: { title: "Test", artistName: "Artist", releaseYear: "2020" },
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe("Forbidden");
  });

  it("returns 403 when user is not admin", async () => {
    mockAuth.mockResolvedValue({ user: { role: "user" } });

    const req = mockRequest({
      method: "POST",
      body: { title: "Test", artistName: "Artist", releaseYear: "2020" },
    });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it("returns 400 when required fields are missing", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });

    const req = mockRequest({
      method: "POST",
      body: { title: "Test" },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid album data");
  });

  it("creates album with valid data", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    const createdAlbum = {
      id: 1,
      title: "Test Album",
      artistName: "Test Artist",
      releaseYear: 2020,
    };
    mockCreate.mockResolvedValue(createdAlbum);

    const req = mockRequest({
      method: "POST",
      body: {
        title: "Test Album",
        artistName: "Test Artist",
        releaseYear: "2020",
      },
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(createdAlbum);
  });

  it("passes genre IDs to prisma create", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockCreate.mockResolvedValue({ id: 1 });

    const req = mockRequest({
      method: "POST",
      body: {
        title: "Test Album",
        artistName: "Test Artist",
        releaseYear: "2020",
        genreIds: [1, 2],
      },
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          genres: {
            create: [
              { genre: { connect: { id: 1 } } },
              { genre: { connect: { id: 2 } } },
            ],
          },
        }),
      })
    );
  });
});
