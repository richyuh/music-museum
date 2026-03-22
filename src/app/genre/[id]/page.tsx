import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { AlbumCoverCard } from "@/components/gallery/album-cover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GALLERY_GRID_SMALL_CLASSES } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const genre = await prisma.genre.findFirst({
    where: { slug: id },
    select: { name: true, description: true },
  });

  if (!genre) return { title: "Genre Not Found" };

  return {
    title: `${genre.name} | Music Museum`,
    description: genre.description || `Explore ${genre.name} albums`,
    twitter: {
      card: "summary_large_image",
      title: `${genre.name} | Music Museum`,
      description: genre.description || `Explore ${genre.name} albums`,
    },
  };
}

export default async function GenreRoomPage({ params }: Props) {
  const { id } = await params;

  const genre = await prisma.genre.findFirst({
    where: { slug: id },
    include: {
      parentGenre: { select: { id: true, name: true, slug: true } },
      childGenres: {
        select: { id: true, name: true, slug: true, description: true, colorHex: true },
        orderBy: { name: "asc" },
      },
      adjacentTo: {
        include: {
          adjacentGenre: {
            select: { id: true, name: true, slug: true, description: true, colorHex: true },
          },
        },
      },
      heroAlbums: {
        orderBy: { position: "asc" },
        take: 12,
        include: {
          album: {
            include: {
              genres: {
                include: {
                  genre: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      },
      canonAlbums: {
        orderBy: { position: "asc" },
        take: 24,
        include: {
          album: {
            include: {
              genres: {
                include: {
                  genre: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!genre) notFound();

  // Get all albums in this genre for "All Albums" section
  const allAlbumsInGenre = await prisma.album.findMany({
    where: {
      genres: { some: { genreId: genre.id } },
    },
    include: {
      genres: {
        include: {
          genre: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { impactScore: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Genre Hero Banner */}
      <div
        className="relative border-b px-4 py-12 md:px-6 md:py-16"
        style={{
          background: genre.colorHex
            ? `linear-gradient(135deg, ${genre.colorHex}15, ${genre.colorHex}05)`
            : undefined,
        }}
      >
        <div className="mx-auto max-w-6xl">
          {genre.parentGenre && (
            <Link href={`/genre/${genre.parentGenre.slug}`}>
              <Badge variant="outline" className="mb-3 cursor-pointer hover:bg-accent">
                {genre.parentGenre.name}
              </Badge>
            </Link>
          )}
          <h1
            className="text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: genre.colorHex || undefined }}
          >
            {genre.name}
          </h1>
          {genre.description && (
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              {genre.description}
            </p>
          )}

          {/* Child genres / subgenres */}
          {genre.childGenres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {genre.childGenres.map((child) => (
                <Link key={child.slug} href={`/genre/${child.slug}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: child.colorHex ? `${child.colorHex}20` : undefined,
                      color: child.colorHex || undefined,
                    }}
                  >
                    {child.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 space-y-12">
        {/* Start Here */}
        {genre.heroAlbums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Start Here</h2>
            <p className="text-sm text-muted-foreground mb-4">
              New to {genre.name}? These are the essential entry points.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {genre.heroAlbums.map(({ album }) => (
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
              ))}
            </div>
          </section>
        )}

        {/* The Canon */}
        {genre.canonAlbums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">The Canon</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The essential {genre.name} albums every listener should know.
            </p>
            <div className={GALLERY_GRID_SMALL_CLASSES}>
              {genre.canonAlbums.map(({ album }) => (
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
              ))}
            </div>
          </section>
        )}

        {/* Adjacent Genres */}
        {genre.adjacentTo.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Explore Adjacent Genres</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {genre.adjacentTo.map(({ adjacentGenre }) => (
                <Link key={adjacentGenre.slug} href={`/genre/${adjacentGenre.slug}`}>
                  <div
                    className="rounded-lg border p-4 transition-colors hover:bg-accent cursor-pointer"
                    style={{
                      borderColor: adjacentGenre.colorHex
                        ? `${adjacentGenre.colorHex}30`
                        : undefined,
                    }}
                  >
                    <h3
                      className="font-semibold"
                      style={{ color: adjacentGenre.colorHex || undefined }}
                    >
                      {adjacentGenre.name}
                    </h3>
                    {adjacentGenre.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {adjacentGenre.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Albums */}
        {allAlbumsInGenre.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">All Albums</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/?genre=${genre.slug}`}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className={GALLERY_GRID_SMALL_CLASSES}>
              {allAlbumsInGenre.map((album) => (
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
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
