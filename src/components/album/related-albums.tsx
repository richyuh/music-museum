"use client";

import { AlbumCoverCard } from "@/components/gallery/album-cover-card";

interface RelatedAlbum {
  id: number;
  title: string;
  artistName: string;
  releaseYear: number;
  coverUrl: string;
  impactTier: string;
  genres: { genre: { id: number; name: string; slug: string } }[];
}

interface RelatedAlbumsProps {
  title: string;
  albums: RelatedAlbum[];
}

export function RelatedAlbums({ title, albums }: RelatedAlbumsProps) {
  if (albums.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {albums.map((album) => (
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
    </div>
  );
}
