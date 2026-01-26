"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      return res.json();
    },
    enabled: debouncedQuery.length >= 2,
  });
}
