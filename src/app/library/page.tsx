"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { AlbumCoverCard } from "@/components/gallery/album-cover-card";
import { useSavedAlbums } from "@/hooks/use-library";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FolderOpen, Heart } from "lucide-react";

export default function LibraryPage() {
  const { data: savedAlbums, isLoading } = useSavedAlbums();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Heart className="h-7 w-7" />
              My Library
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your saved albums
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/library/rooms">
              <FolderOpen className="mr-2 h-4 w-4" />
              My Rooms
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : savedAlbums && savedAlbums.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {savedAlbums.map(
              (album: {
                id: number;
                title: string;
                artistName: string;
                releaseYear: number;
                coverUrl: string;
                impactTier: string;
                genres: { genre: { id: number; name: string; slug: string } }[];
              }) => (
                <AlbumCoverCard
                  key={album.id}
                  id={album.id}
                  title={album.title}
                  artistName={album.artistName}
                  releaseYear={album.releaseYear}
                  coverUrl={album.coverUrl}
                  impactTier={album.impactTier}
                  genres={album.genres}
                  size="sm"
                />
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No saved albums yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Browse the gallery and save albums you love.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/">Explore the Museum</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
