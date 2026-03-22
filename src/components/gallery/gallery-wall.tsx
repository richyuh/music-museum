"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { VirtuosoGrid } from "react-virtuoso";
import { motion } from "framer-motion";
import { AlbumCoverCard } from "./album-cover-card";
import { GalleryFilters } from "./gallery-filters";
import { useAlbums } from "@/hooks/use-albums";
import { Skeleton } from "@/components/ui/skeleton";
import { GALLERY_GRID_CLASSES } from "@/lib/constants";

interface AlbumData {
  id: number;
  title: string;
  artistName: string;
  releaseYear: number;
  coverUrl: string;
  impactTier: string;
  genres: { genre: { id: number; name: string; slug: string } }[];
}

const gridComponents = {
  List: ({ style, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      {...props}
      style={{ ...style }}
      className={`${GALLERY_GRID_CLASSES} px-4 md:px-6`}
    >
      {children}
    </div>
  ),
  Item: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
};

export function GalleryWall() {
  const searchParams = useSearchParams();
  const [, setFiltersVersion] = useState(0);

  const filters = useMemo(() => ({
    genre: searchParams.get("genre") || undefined,
    yearMin: searchParams.get("yearMin") ? parseInt(searchParams.get("yearMin")!) : undefined,
    yearMax: searchParams.get("yearMax") ? parseInt(searchParams.get("yearMax")!) : undefined,
    tier: searchParams.get("tier") || undefined,
    sort: searchParams.get("sort") || "impact-desc",
    limit: 60,
  }), [searchParams]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useAlbums(filters);

  const albums = useMemo(
    () => data?.pages.flatMap((page) => page.albums) ?? [],
    [data]
  );

  const totalCount = data?.pages[0]?.total ?? 0;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFiltersChange = useCallback(() => {
    setFiltersVersion((v) => v + 1);
  }, []);

  // Track window height for virtuoso
  const [windowHeight, setWindowHeight] = useState(800);
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div>
        <GalleryFilters onFiltersChange={handleFiltersChange} />
        <div className={`${GALLERY_GRID_CLASSES} px-4 md:px-6 py-4`}>
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <GalleryFilters onFiltersChange={handleFiltersChange} />

      {/* Album count */}
      <div className="px-4 md:px-6 py-2">
        <p className="text-xs text-muted-foreground">
          {totalCount} album{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {albums.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">No albums found matching your filters.</p>
        </div>
      ) : (
        <VirtuosoGrid
          style={{ height: windowHeight - 140 }}
          totalCount={albums.length}
          endReached={handleEndReached}
          overscan={200}
          components={gridComponents}
          itemContent={(index) => {
            const album = albums[index] as AlbumData | undefined;
            if (!album) return <Skeleton className="aspect-square rounded-md" />;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: (index % 20) * 0.02 }}
              >
                <AlbumCoverCard
                  id={album.id}
                  title={album.title}
                  artistName={album.artistName}
                  releaseYear={album.releaseYear}
                  coverUrl={album.coverUrl}
                  impactTier={album.impactTier}
                  genres={album.genres}
                />
              </motion.div>
            );
          }}
        />
      )}

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
