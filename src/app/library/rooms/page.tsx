"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { useRooms, useCreateRoom } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FolderOpen } from "lucide-react";

function getPlaceholderColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 50%, 30%)`;
}

export default function RoomsPage() {
  const { data: rooms, isLoading } = useRooms();
  const createRoom = useCreateRoom();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [open, setOpen] = useState(false);

  async function handleCreate() {
    if (!newName.trim()) return;
    await createRoom.mutateAsync({ name: newName, description: newDesc || undefined });
    setNewName("");
    setNewDesc("");
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FolderOpen className="h-7 w-7" />
              My Rooms
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your curated collections
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Room name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || createRoom.isPending}
                  className="w-full"
                >
                  {createRoom.isPending ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.map(
              (room: {
                id: number;
                name: string;
                description: string | null;
                albums: { album: { id: number; coverUrl: string; title: string } }[];
                _count: { albums: number };
              }) => (
                <Link key={room.id} href={`/library/rooms/${room.id}`}>
                  <div className="rounded-lg border overflow-hidden transition-colors hover:bg-accent cursor-pointer">
                    {/* Thumbnail grid */}
                    <div className="grid grid-cols-2 aspect-video">
                      {room.albums.slice(0, 4).map(({ album }) => (
                        <div
                          key={album.id}
                          className="relative aspect-square"
                        >
                          {album.coverUrl && !album.coverUrl.startsWith("placeholder") ? (
                            <Image
                              src={album.coverUrl}
                              alt={album.title}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                          ) : (
                            <div
                              className="h-full w-full"
                              style={{ backgroundColor: getPlaceholderColor(album.title) }}
                            />
                          )}
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 4 - room.albums.length) }).map(
                        (_, idx) => (
                          <div key={`empty-${idx}`} className="bg-muted" />
                        )
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {room._count.albums} album{room._count.albums !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No rooms yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a room to start organizing your albums.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
