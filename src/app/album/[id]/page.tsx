import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRelatedAlbums } from "@/lib/related-albums";
import { Header } from "@/components/layout/header";
import { AlbumLinks } from "@/components/album/album-links";
import { SaveAlbumButton } from "@/components/album/save-album-button";
import { RelatedAlbums } from "@/components/album/related-albums";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id: parseInt(id) },
    select: { title: true, artistName: true, coverUrl: true, summary: true },
  });

  if (!album) return { title: "Album Not Found" };

  return {
    title: `${album.title} - ${album.artistName} | Music Museum`,
    description: album.summary || `${album.title} by ${album.artistName}`,
    openGraph: {
      type: "music.album",
      title: `${album.title} - ${album.artistName}`,
      description: album.summary || undefined,
      images: album.coverUrl ? [album.coverUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${album.title} - ${album.artistName}`,
      description: album.summary || `${album.title} by ${album.artistName}`,
    },
  };
}

function getPlaceholderColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 30%)`;
}

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const albumId = parseInt(id);
  if (isNaN(albumId)) notFound();

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      genres: {
        include: {
          genre: { select: { id: true, name: true, slug: true, colorHex: true } },
        },
      },
    },
  });

  if (!album) notFound();

  const genreIds = album.genres.map((ag) => ag.genreId);
  const { sameRoom, adjacent } = await getRelatedAlbums(
    album.id,
    genreIds,
    album.releaseYear
  );

  const subgenres: string[] = (() => {
    try {
      return JSON.parse(album.subgenresJson);
    } catch {
      return [];
    }
  })();

  const tierColors: Record<string, string> = {
    Landmark: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Essential: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Notable: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* Above the fold */}
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Cover art */}
          <div className="flex-shrink-0">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-2xl md:w-80">
              {album.coverUrl && !album.coverUrl.startsWith("placeholder") ? (
                <Image
                  src={album.coverUrl}
                  alt={`${album.title} cover art`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center p-8"
                  style={{ backgroundColor: getPlaceholderColor(album.title) }}
                >
                  <div className="text-center">
                    <p className="text-xl font-bold text-white/90">{album.title}</p>
                    <p className="mt-2 text-sm text-white/60">{album.artistName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {album.title}
              </h1>
              <p className="mt-1 text-xl text-muted-foreground">
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
              {subgenres.map((sg: string) => (
                <Badge key={sg} variant="outline" className="text-xs">
                  {sg}
                </Badge>
              ))}
            </div>

            {/* Placard story */}
            {album.summary && (
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm leading-relaxed text-card-foreground">
                  {album.summary}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <SaveAlbumButton albumId={album.id} />
              <AlbumLinks linksJson={album.linksJson} />
            </div>
          </div>
        </div>

        {/* Related albums */}
        <div className="mt-12 space-y-8">
          <RelatedAlbums title="In This Room" albums={sameRoom} />
          <RelatedAlbums title="Adjacent Movement" albums={adjacent} />
        </div>
      </main>
    </div>
  );
}
