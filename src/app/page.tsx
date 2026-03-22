import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { GalleryWall } from "@/components/gallery/gallery-wall";
import { Skeleton } from "@/components/ui/skeleton";
import { GALLERY_GRID_CLASSES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Gallery | Music Museum",
  description: "Browse the gallery wall — hundreds of album covers organized by genre, era, and impact.",
};

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
      <Suspense fallback={<GalleryLoadingSkeleton />}>
        <GalleryWall />
      </Suspense>
    </div>
  );
}
