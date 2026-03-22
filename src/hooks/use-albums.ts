"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

interface AlbumFilters {
  genre?: string;
  yearMin?: number;
  yearMax?: number;
  tier?: string;
  sort?: string;
  limit?: number;
}

export function useAlbums(filters: AlbumFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["albums", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.genre) params.set("genre", filters.genre);
      if (filters.yearMin) params.set("yearMin", String(filters.yearMin));
      if (filters.yearMax) params.set("yearMax", String(filters.yearMax));
      if (filters.tier) params.set("tier", filters.tier);
      if (filters.sort) params.set("sort", filters.sort);

      const res = await fetch(`/api/albums?${params}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch albums: ${res.status}`);
      }
      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useAlbumDetail(id: number | null) {
  return useQuery({
    queryKey: ["album", id],
    queryFn: async () => {
      const res = await fetch(`/api/albums/${id}`);
      if (!res.ok) throw new Error("Failed to fetch album");
      return res.json();
    },
    enabled: id !== null,
  });
}
