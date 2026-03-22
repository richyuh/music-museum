"use client";

import { useQuery } from "@tanstack/react-query";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await fetch("/api/genres");
      if (!res.ok) {
        throw new Error(`Failed to fetch genres: ${res.status}`);
      }
      return res.json();
    },
  });
}

export function useGenreDetail(slugOrId: string | null) {
  return useQuery({
    queryKey: ["genre", slugOrId],
    queryFn: async () => {
      const res = await fetch(`/api/genres/${slugOrId}`);
      if (!res.ok) throw new Error("Failed to fetch genre");
      return res.json();
    },
    enabled: slugOrId !== null,
  });
}
