import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { GalleryWall } from "@/components/gallery/gallery-wall";
import { Skeleton } from "@/components/ui/skeleton";

function GalleryLoadingSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 px-4 md:px-6 py-4">
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
