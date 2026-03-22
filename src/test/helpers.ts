import { NextRequest } from "next/server";

interface MockRequestOptions {
  body?: Record<string, unknown>;
  searchParams?: Record<string, string>;
  method?: string;
}

export function mockRequest(options: MockRequestOptions = {}): NextRequest {
  const { body, searchParams, method = "GET" } = options;

  const url = new URL("http://localhost:3000/api/test");
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }

  return new NextRequest(url, init);
}
