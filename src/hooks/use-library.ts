"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSavedAlbums() {
  return useQuery({
    queryKey: ["savedAlbums"],
    queryFn: async () => {
      const res = await fetch("/api/library/saved");
      if (!res.ok) return [];
      return res.json();
    },
  });
}

export function useSaveAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, save }: { albumId: number; save: boolean }) => {
      const res = await fetch("/api/library/saved", {
        method: save ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId }),
      });
      return res.json();
    },
    onSuccess: (_data: unknown, variables: { albumId: number; save: boolean }) => {
      toast.success(variables.save ? "Album saved" : "Album removed");
      queryClient.invalidateQueries({ queryKey: ["savedAlbums"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    },
  });
}

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch("/api/library/rooms");
      if (!res.ok) return [];
      return res.json();
    },
  });
}

export function useRoomDetail(id: number | null) {
  return useQuery({
    queryKey: ["room", id],
    queryFn: async () => {
      const res = await fetch(`/api/library/rooms/${id}`);
      if (!res.ok) throw new Error("Failed to fetch room");
      return res.json();
    },
    enabled: id !== null,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch("/api/library/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Room created");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    },
  });
}

export function useAddAlbumToRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      albumId,
    }: {
      roomId: number;
      albumId: number;
    }) => {
      const res = await fetch(`/api/library/rooms/${roomId}/albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId }),
      });
      return res.json();
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    },
  });
}

export function useRemoveAlbumFromRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      albumId,
    }: {
      roomId: number;
      albumId: number;
    }) => {
      const res = await fetch(`/api/library/rooms/${roomId}/albums`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId }),
      });
      return res.json();
    },
    onSuccess: (_, { roomId }) => {
      toast.success("Album removed from room");
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    },
  });
}
