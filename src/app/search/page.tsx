"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AlbumCoverCard } from "@/components/gallery/album-cover-card";
import { useSearch } from "@/hooks/use-search";
import { Skeleton } from "@/components/ui/skeleton";
import { GALLERY_GRID_SMALL_CLASSES } from "@/lib/constants";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { data: results, isLoading } = useSearch(query);

  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Search Results</h1>
      {query && (
        <p className="text-sm text-muted-foreground mb-6">
          {isLoading
            ? "Searching..."
            : `${results?.length || 0} results for "${query}"`}
        </p>
      )}

      {isLoading ? (
        <div className={GALLERY_GRID_SMALL_CLASSES}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      ) : results && results.length > 0 ? (
        <div className={GALLERY_GRID_SMALL_CLASSES}>
          {results.map(
            (album: {
              id: number;
              title: string;
              artistName: string;
              releaseYear: number;
              coverUrl: string;
              impactTier: string;
            }) => (
              <AlbumCoverCard
                key={album.id}
                id={album.id}
                title={album.title}
                artistName={album.artistName}
                releaseYear={album.releaseYear}
                coverUrl={album.coverUrl}
                impactTier={album.impactTier}
                size="sm"
              />
            )
          )}
        </div>
      ) : query ? (
        <p className="text-muted-foreground">
          No albums found. Try a different search term.
        </p>
      ) : (
        <p className="text-muted-foreground">
          Enter a search term to find albums.
        </p>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Suspense
          fallback={
            <div className={GALLERY_GRID_SMALL_CLASSES}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </main>
    </div>
  );
}
