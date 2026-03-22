import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockFindUnique = vi.fn();
const mockUserCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockUserCreate(...args),
    },
  },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}));

import { POST } from "@/app/api/auth/signup/route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue(null);
  });

  it("creates a user with valid credentials", async () => {
    const createdUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
    };
    mockUserCreate.mockResolvedValue(createdUser);

    const req = makeRequest({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.email).toBe("test@example.com");
    expect(data.name).toBe("Test User");
    expect(data.id).toBe("user-1");
  });

  it("returns 400 when email is missing", async () => {
    const req = makeRequest({ password: "password123" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("returns 400 when password is missing", async () => {
    const req = makeRequest({ email: "test@example.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("returns 400 when password is too short (min 8 chars)", async () => {
    const req = makeRequest({
      email: "test@example.com",
      password: "12345",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("returns 409 when email already exists", async () => {
    mockFindUnique.mockResolvedValue({
      id: "existing",
      email: "test@example.com",
    });

    const req = makeRequest({
      email: "test@example.com",
      password: "password123",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("An account with this email already exists");
  });

  it("hashes the password before storing", async () => {
    mockUserCreate.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: null,
    });

    const req = makeRequest({
      email: "test@example.com",
      password: "password123",
    });
    await POST(req);

    expect(mockUserCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        passwordHash: "hashed_password",
        email: "test@example.com",
      }),
    });
  });

  it("sets name to null when not provided", async () => {
    mockUserCreate.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: null,
    });

    const req = makeRequest({
      email: "test@example.com",
      password: "password123",
    });
    await POST(req);

    expect(mockUserCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: null }),
    });
  });

  it("returns 500 on unexpected errors", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB connection failed"));

    const req = makeRequest({
      email: "test@example.com",
      password: "password123",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
