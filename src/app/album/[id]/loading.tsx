import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";

export default function AlbumLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <Skeleton className="aspect-square w-full flex-shrink-0 rounded-lg md:w-80" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </main>
    </div>
  );
}
