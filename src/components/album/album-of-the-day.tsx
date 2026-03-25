import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlbumSummary } from "@/components/album/album-summary";
import { AlbumLinks } from "@/components/album/album-links";
import { getAlbumOfTheDay } from "@/lib/album-of-the-day";

function getPlaceholderColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 30%)`;
}

const tierColors: Record<string, string> = {
  Landmark: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Essential: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Notable: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export async function AlbumOfTheDay() {
  const album = await getAlbumOfTheDay();

  if (!album) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="rounded-xl border bg-card/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-muted-foreground">
            Album of the Day
          </span>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Cover art */}
          <div className="flex-shrink-0">
            <Link href={`/album/${album.id}`}>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-2xl md:w-64">
                {album.coverUrl &&
                !album.coverUrl.startsWith("placeholder") ? (
                  <Image
                    src={album.coverUrl}
                    alt={`${album.title} cover art`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 256px"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center p-8"
                    style={{
                      backgroundColor: getPlaceholderColor(album.title),
                    }}
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold text-white/90">
                        {album.title}
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        {album.artistName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {album.title}
              </h2>
              <p className="mt-1 text-lg text-muted-foreground">
                {album.artistName}
              </p>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {album.releaseYear}
              </Badge>
              <Badge
                variant="outline"
                className={tierColors[album.impactTier] || tierColors.Notable}
              >
                {album.impactTier}
              </Badge>
              {album.genres.map((ag) => (
                <Link key={ag.genre.slug} href={`/genre/${ag.genre.slug}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: ag.genre.colorHex
                        ? `${ag.genre.colorHex}20`
                        : undefined,
                      color: ag.genre.colorHex || undefined,
                      borderColor: ag.genre.colorHex
                        ? `${ag.genre.colorHex}40`
                        : undefined,
                    }}
                  >
                    {ag.genre.name}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* Summary */}
            {album.summary && <AlbumSummary summary={album.summary} />}

            {/* Links */}
            <AlbumLinks linksJson={album.linksJson} />

            {/* View full exhibit link */}
            <Link
              href={`/album/${album.id}`}
              className="inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View full exhibit →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
