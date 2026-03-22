import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function AdminGenresPage() {
  const genres = await prisma.genre.findMany({
    include: {
      parentGenre: { select: { name: true } },
      childGenres: { select: { id: true } },
      _count: { select: { albums: true, heroAlbums: true, canonAlbums: true } },
    },
    orderBy: [{ parentGenreId: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Genres ({genres.length})</h1>

      {genres.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No genres yet. Create your first genre.</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Slug</th>
              <th className="p-3 text-left font-medium">Parent</th>
              <th className="p-3 text-left font-medium">Albums</th>
              <th className="p-3 text-left font-medium">Hero / Canon</th>
              <th className="p-3 text-left font-medium">Color</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre.id} className="border-b hover:bg-muted/20">
                <td className="p-3 font-medium">
                  <Link href={`/genre/${genre.slug}`} className="hover:underline">
                    {genre.name}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{genre.slug}</td>
                <td className="p-3 text-xs">{genre.parentGenre?.name || "—"}</td>
                <td className="p-3">{genre._count.albums}</td>
                <td className="p-3 text-xs">
                  {genre._count.heroAlbums} / {genre._count.canonAlbums}
                </td>
                <td className="p-3">
                  {genre.colorHex && (
                    <Badge
                      style={{
                        backgroundColor: `${genre.colorHex}20`,
                        color: genre.colorHex,
                      }}
                    >
                      {genre.colorHex}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
