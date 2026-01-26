import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/layout/header";

export default function GenreLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-12 w-48 mb-3" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </main>
    </div>
  );
}
