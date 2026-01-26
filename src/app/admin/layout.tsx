import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Disc3, Music, Tag } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-card p-4 space-y-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-sm">
          <Disc3 className="h-4 w-4" />
          Admin Panel
        </Link>
        <nav className="space-y-1">
          <Link
            href="/admin/albums"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Music className="h-4 w-4" />
            Albums
          </Link>
          <Link
            href="/admin/genres"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Tag className="h-4 w-4" />
            Genres
          </Link>
        </nav>
        <div className="pt-4 border-t">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            Back to Museum
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
