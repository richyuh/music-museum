"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface AlbumCoverCardProps {
  id: number;
  title: string;
  artistName: string;
  releaseYear: number;
  coverUrl: string;
  impactTier?: string;
  genres?: { genre: { name: string; slug: string } }[];
  size?: "sm" | "md" | "lg";
}

function getPlaceholderColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 30%)`;
}

export function AlbumCoverCard({
  id,
  title,
  artistName,
  releaseYear,
  coverUrl,
  impactTier,
  size = "md",
}: AlbumCoverCardProps) {
  const sizeClasses = {
    sm: "w-full aspect-square",
    md: "w-full aspect-square",
    lg: "w-full aspect-square",
  };

  return (
    <Link href={`/album/${id}`}>
      <motion.div
        className={`group relative overflow-hidden rounded-md ${sizeClasses[size]}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Cover image */}
        <div className="relative h-full w-full">
          {coverUrl && !coverUrl.includes("placehold") ? (
            <Image
              src={coverUrl}
              alt={`${title} by ${artistName}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center p-4"
              style={{ backgroundColor: getPlaceholderColor(title) }}
            >
              <div className="text-center">
                <p className="text-xs font-bold text-white/90 line-clamp-2">
                  {title}
                </p>
                <p className="mt-1 text-[10px] text-white/60">{artistName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <p className="text-sm font-semibold text-white line-clamp-2 leading-tight">
            {title}
          </p>
          <p className="text-xs text-white/80 mt-0.5">{artistName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-white/60">{releaseYear}</span>
            {impactTier && impactTier !== "Notable" && (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[9px] bg-white/20 text-white border-0"
              >
                {impactTier}
              </Badge>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
