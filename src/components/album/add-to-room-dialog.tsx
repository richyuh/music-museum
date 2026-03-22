"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRooms, useAddAlbumToRoom } from "@/hooks/use-library";

interface AddToRoomDialogProps {
  albumId: number;
}

export function AddToRoomDialog({ albumId }: AddToRoomDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: rooms, isLoading } = useRooms();
  const addAlbum = useAddAlbumToRoom();

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push("/auth/signin")}>
        <FolderPlus className="mr-1.5 h-4 w-4" />
        Add to Room
      </Button>
    );
  }

  async function handleAdd(roomId: number, roomName: string) {
    try {
      await addAlbum.mutateAsync({ roomId, albumId });
      toast.success(`Added to ${roomName}`);
      setOpen(false);
    } catch {
      toast.error("Failed to add album to room");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="mr-1.5 h-4 w-4" />
          Add to Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Room</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading rooms...</p>
          ) : rooms && rooms.length > 0 ? (
            rooms.map((room: { id: number; name: string }) => (
              <button
                key={room.id}
                onClick={() => handleAdd(room.id, room.name)}
                disabled={addAlbum.isPending}
                className="flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors hover:bg-accent"
              >
                <span className="text-sm font-medium">{room.name}</span>
              </button>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No rooms yet.</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  router.push("/library/rooms");
                }}
              >
                Create a room first
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
