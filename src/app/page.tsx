import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { GalleryWall } from "@/components/gallery/gallery-wall";
import { AlbumOfTheDay } from "@/components/album/album-of-the-day";
import { Skeleton } from "@/components/ui/skeleton";
import { GALLERY_GRID_CLASSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery | Music Museum",
  description: "Browse the gallery wall — hundreds of album covers organized by genre, era, and impact.",
};

function AlbumOfTheDaySkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="rounded-xl border bg-card/50 p-6">
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="flex flex-col gap-6 md:flex-row">
          <Skeleton className="aspect-square w-full flex-shrink-0 rounded-lg md:w-64" />
          <div className="flex-1 space-y-4">
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-5 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryLoadingSkeleton() {
  return (
    <div className={`${GALLERY_GRID_CLASSES} px-4 md:px-6 py-4`}>
      {Array.from({ length: 24 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-md" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<AlbumOfTheDaySkeleton />}>
        <AlbumOfTheDay />
      </Suspense>
      <Suspense fallback={<GalleryLoadingSkeleton />}>
        <GalleryWall />
      </Suspense>
    </div>
  );
}
