"use client";

import { useState } from "react";

const SUMMARY_THRESHOLD = 300;

interface AlbumSummaryProps {
  summary: string;
}

export function AlbumSummary({ summary }: AlbumSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = summary.length > SUMMARY_THRESHOLD;

  const displayText =
    isLong && !expanded
      ? summary.slice(0, SUMMARY_THRESHOLD).replace(/\s+\S*$/, "") + "…"
      : summary;

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm leading-relaxed text-card-foreground">
        {displayText}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
