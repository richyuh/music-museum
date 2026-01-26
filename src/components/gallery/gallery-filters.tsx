"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { IMPACT_TIERS } from "@/lib/constants";

const GENRES = [
  { slug: "rock", name: "Rock" },
  { slug: "hip-hop", name: "Hip-Hop" },
  { slug: "electronic", name: "Electronic" },
  { slug: "jazz", name: "Jazz" },
  { slug: "rnb-soul", name: "R&B / Soul" },
  { slug: "pop", name: "Pop" },
  { slug: "metal", name: "Metal" },
  { slug: "folk-country", name: "Folk / Country" },
];

const SORT_OPTIONS = [
  { value: "impact-desc", label: "Impact" },
  { value: "year-desc", label: "Newest" },
  { value: "year-asc", label: "Oldest" },
  { value: "title-asc", label: "A-Z" },
];

interface GalleryFiltersProps {
  onFiltersChange: (filters: Record<string, string | undefined>) => void;
}

export function GalleryFilters({ onFiltersChange }: GalleryFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeGenre = searchParams.get("genre") || undefined;
  const activeTier = searchParams.get("tier") || undefined;
  const activeSort = searchParams.get("sort") || "impact-desc";
  const yearMin = searchParams.get("yearMin")
    ? parseInt(searchParams.get("yearMin")!)
    : 1950;
  const yearMax = searchParams.get("yearMax")
    ? parseInt(searchParams.get("yearMax")!)
    : 2025;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`/?${params.toString()}`);
      onFiltersChange(updates);
    },
    [searchParams, router, onFiltersChange]
  );

  const hasFilters = activeGenre || activeTier || yearMin > 1950 || yearMax < 2025;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b md:px-6">
      {/* Genre select */}
      <Select
        value={activeGenre || "all"}
        onValueChange={(v) => updateParams({ genre: v === "all" ? undefined : v })}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="All Genres" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {GENRES.map((g) => (
            <SelectItem key={g.slug} value={g.slug}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year range */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-xs text-muted-foreground">{yearMin}</span>
        <Slider
          min={1950}
          max={2025}
          step={5}
          value={[yearMin, yearMax]}
          onValueChange={([min, max]) =>
            updateParams({
              yearMin: min > 1950 ? String(min) : undefined,
              yearMax: max < 2025 ? String(max) : undefined,
            })
          }
          className="w-[160px]"
        />
        <span className="text-xs text-muted-foreground">{yearMax}</span>
      </div>

      {/* Impact tier toggles */}
      <div className="flex gap-1">
        {IMPACT_TIERS.map((tier) => (
          <Badge
            key={tier}
            variant={activeTier === tier ? "default" : "outline"}
            className="cursor-pointer text-[10px] h-6"
            onClick={() =>
              updateParams({ tier: activeTier === tier ? undefined : tier })
            }
          >
            {tier}
          </Badge>
        ))}
      </div>

      {/* Sort */}
      <Select
        value={activeSort}
        onValueChange={(v) => updateParams({ sort: v })}
      >
        <SelectTrigger className="w-[100px] h-8 text-xs ml-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() =>
            updateParams({
              genre: undefined,
              tier: undefined,
              yearMin: undefined,
              yearMax: undefined,
              sort: undefined,
            })
          }
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
