"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { IMPACT_TIERS, GENRES, YEAR_RANGE, DECADES } from "@/lib/constants";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TIER_DESCRIPTIONS: Record<string, string> = {
  Landmark: "Top 10% — the most culturally significant albums",
  Essential: "Top 35% — highly influential albums",
  Notable: "Noteworthy albums worth discovering",
};

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
  const [aotdId, setAotdId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/albums/album-of-the-day")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.id) setAotdId(data.id); })
      .catch(() => {});
  }, []);

  const activeGenre = searchParams.get("genre") || undefined;
  const activeTier = searchParams.get("tier") || undefined;
  const activeSort = searchParams.get("sort") || "impact-desc";
  const yearMin = searchParams.get("yearMin")
    ? parseInt(searchParams.get("yearMin")!)
    : YEAR_RANGE.min;
  const yearMax = searchParams.get("yearMax")
    ? parseInt(searchParams.get("yearMax")!)
    : YEAR_RANGE.max;

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

  const hasFilters = activeGenre || activeTier || yearMin > YEAR_RANGE.min || yearMax < YEAR_RANGE.max;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b md:px-6">
      {/* Genre select */}
      <Select
        value={activeGenre || "all"}
        onValueChange={(v) => updateParams({ genre: v === "all" ? undefined : v })}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs" aria-label="Filter by genre">
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

      {/* Mobile year inputs */}
      <div className="flex items-center gap-2 sm:hidden">
        <input
          type="number"
          min={YEAR_RANGE.min}
          max={YEAR_RANGE.max}
          value={yearMin}
          onChange={(e) => updateParams({ yearMin: e.target.value ? e.target.value : undefined })}
          className="w-16 h-8 rounded-md border bg-background px-2 text-xs"
          placeholder="From"
          aria-label="Year from"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <input
          type="number"
          min={YEAR_RANGE.min}
          max={YEAR_RANGE.max}
          value={yearMax}
          onChange={(e) => updateParams({ yearMax: e.target.value ? e.target.value : undefined })}
          className="w-16 h-8 rounded-md border bg-background px-2 text-xs"
          placeholder="To"
          aria-label="Year to"
        />
      </div>

      {/* Desktop year range slider */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-xs text-muted-foreground">{yearMin}</span>
        <Slider
          min={YEAR_RANGE.min}
          max={YEAR_RANGE.max}
          step={5}
          value={[yearMin, yearMax]}
          onValueChange={([min, max]) =>
            updateParams({
              yearMin: min > 1950 ? String(min) : undefined,
              yearMax: max < 2025 ? String(max) : undefined,
            })
          }
          className="w-[160px]"
          aria-label="Year range"
        />
        <span className="text-xs text-muted-foreground">{yearMax}</span>
      </div>

      {/* Decade filter buttons */}
      <div className="flex gap-1">
        {DECADES.map((decade) => {
          const isActive = yearMin === decade.min && yearMax === decade.max;
          return (
            <button
              key={decade.label}
              type="button"
              onClick={() =>
                updateParams({
                  yearMin: isActive ? undefined : String(decade.min),
                  yearMax: isActive ? undefined : String(decade.max),
                })
              }
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors",
                isActive
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent"
              )}
              aria-pressed={isActive}
              aria-label={`Filter by ${decade.label}`}
            >
              {decade.label}
            </button>
          );
        })}
      </div>

      {/* Impact tier toggles */}
      <div className="flex gap-1">
        {IMPACT_TIERS.map((tier) => (
          <Tooltip key={tier}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() =>
                  updateParams({ tier: activeTier === tier ? undefined : tier })
                }
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors min-h-[44px] min-w-[44px] justify-center",
                  activeTier === tier
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                )}
                aria-pressed={activeTier === tier}
                aria-label={`Filter by ${tier} tier`}
              >
                {tier}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {TIER_DESCRIPTIONS[tier]}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Album of the Day */}
      {aotdId && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => router.push(`/album/${aotdId}`)}
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 min-h-[44px] min-w-[44px] justify-center"
              aria-label="Album of the Day"
            >
              <Sparkles className="h-3 w-3" />
              Today
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Album of the Day</TooltipContent>
        </Tooltip>
      )}

      {/* Sort */}
      <Select
        value={activeSort}
        onValueChange={(v) => updateParams({ sort: v })}
      >
        <SelectTrigger className="w-[100px] h-8 text-xs ml-auto" aria-label="Sort albums">
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
