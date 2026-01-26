"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedAlbums, useSaveAlbum } from "@/hooks/use-library";

interface SaveAlbumButtonProps {
  albumId: number;
}

export function SaveAlbumButton({ albumId }: SaveAlbumButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: savedAlbums } = useSavedAlbums();
  const saveAlbum = useSaveAlbum();

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push("/auth/signin")}>
        <Heart className="mr-1.5 h-4 w-4" />
        Save
      </Button>
    );
  }

  const isSaved = savedAlbums?.some(
    (a: { id: number }) => a.id === albumId
  );

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={() =>
        saveAlbum.mutate({ albumId, save: !isSaved })
      }
      disabled={saveAlbum.isPending}
    >
      <Heart
        className={`mr-1.5 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
      />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
