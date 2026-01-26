import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [albumCount, genreCount, userCount] = await Promise.all([
    prisma.album.count(),
    prisma.genre.count(),
    prisma.user.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border p-6">
          <p className="text-3xl font-bold">{albumCount}</p>
          <p className="text-sm text-muted-foreground">Albums</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-3xl font-bold">{genreCount}</p>
          <p className="text-sm text-muted-foreground">Genres</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-3xl font-bold">{userCount}</p>
          <p className="text-sm text-muted-foreground">Users</p>
        </div>
      </div>
    </div>
  );
}
