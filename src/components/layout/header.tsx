"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Library, LogIn, LogOut, User, Menu, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GENRES } from "@/lib/constants";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-4 pt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <Disc3 className="h-5 w-5" />
                Music Museum
              </Link>
              {GENRES.map((g) => (
                <Link key={g.slug} href={`/genre/${g.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                  {g.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Disc3 className="h-5 w-5" />
          <span className="hidden sm:inline">Music Museum</span>
        </Link>

        {/* Genre nav (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">Wings</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {GENRES.map((g) => (
                <DropdownMenuItem key={g.slug} onClick={() => router.push(`/genre/${g.slug}`)}>
                  {g.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search albums..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => router.push("/library")} aria-label="My library">
                <Library className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User menu">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                    {session.user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/library")}>
                    <Library className="mr-2 h-4 w-4" />
                    My Library
                  </DropdownMenuItem>
                  {session.user.role === "admin" && (
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => router.push("/auth/signin")}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
