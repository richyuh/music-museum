"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlbumLinksProps {
  linksJson: string;
}

const LINK_CONFIG: Record<string, { label: string; color: string }> = {
  spotify: { label: "Spotify", color: "bg-green-600 hover:bg-green-700" },
  apple: { label: "Apple Music", color: "bg-pink-600 hover:bg-pink-700" },
  youtube: { label: "YouTube", color: "bg-red-600 hover:bg-red-700" },
};

export function AlbumLinks({ linksJson }: AlbumLinksProps) {
  let links: Record<string, string> = {};
  try {
    links = JSON.parse(linksJson);
  } catch {
    return null;
  }

  const entries = Object.entries(links).filter(
    ([key, value]) => value && LINK_CONFIG[key]
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, url]) => {
        const config = LINK_CONFIG[key];
        return (
          <Button
            key={key}
            size="sm"
            className={`${config.color} text-white`}
            asChild
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3 w-3" />
              {config.label}
            </a>
          </Button>
        );
      })}
    </div>
  );
}
