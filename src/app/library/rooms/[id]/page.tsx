"use client";

import { use } from "react";
import { Header } from "@/components/layout/header";
import { AlbumCoverCard } from "@/components/gallery/album-cover-card";
import { useRoomDetail, useRemoveAlbumFromRoom } from "@/hooks/use-library";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: Props) {
  const { id } = use(params);
  const roomId = parseInt(id);
  const { data: room, isLoading } = useRoomDetail(roomId);
  const removeAlbum = useRemoveAlbumFromRoom();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/library/rooms">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Rooms
          </Link>
        </Button>

        {isLoading ? (
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-32 mb-6" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>
        ) : room ? (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
            {room.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {room.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 mb-6">
              {room.albums.length} album{room.albums.length !== 1 ? "s" : ""}
            </p>

            {room.albums.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {room.albums.map(
                  ({
                    album,
                  }: {
                    album: {
                      id: number;
                      title: string;
                      artistName: string;
                      releaseYear: number;
                      coverUrl: string;
                      impactTier: string;
                      genres: {
                        genre: { id: number; name: string; slug: string };
                      }[];
                    };
                  }) => (
                    <div key={album.id} className="group relative">
                      <AlbumCoverCard
                        id={album.id}
                        title={album.title}
                        artistName={album.artistName}
                        releaseYear={album.releaseYear}
                        coverUrl={album.coverUrl}
                        impactTier={album.impactTier}
                        genres={album.genres}
                        size="sm"
                      />
                      <button
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.preventDefault();
                          removeAlbum.mutate({ roomId, albumId: album.id });
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  This room is empty. Add albums from album pages.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Room not found.</p>
        )}
      </main>
    </div>
  );
}
