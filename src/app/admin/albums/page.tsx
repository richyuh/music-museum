import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminAlbumsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || "1"));
  const limit = 50;

  const [albums, total] = await Promise.all([
    prisma.album.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        genres: { include: { genre: { select: { name: true } } } },
      },
    }),
    prisma.album.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Albums ({total})</h1>
        <Button asChild>
          <Link href="/admin/albums/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Album
          </Link>
        </Button>
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No albums yet. Create your first album.</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">ID</th>
              <th className="p-3 text-left font-medium">Title</th>
              <th className="p-3 text-left font-medium">Artist</th>
              <th className="p-3 text-left font-medium">Year</th>
              <th className="p-3 text-left font-medium">Genres</th>
              <th className="p-3 text-left font-medium">Impact</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => (
              <tr key={album.id} className="border-b hover:bg-muted/20">
                <td className="p-3 text-muted-foreground">{album.id}</td>
                <td className="p-3 font-medium">{album.title}</td>
                <td className="p-3">{album.artistName}</td>
                <td className="p-3">{album.releaseYear}</td>
                <td className="p-3 text-xs">
                  {album.genres.map((g) => g.genre.name).join(", ")}
                </td>
                <td className="p-3">
                  <span className="text-xs">{album.impactTier}</span>
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/albums/${album.id}/edit`}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/albums?page=${page - 1}`}>Previous</Link>
            </Button>
          )}
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/albums?page=${page + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
