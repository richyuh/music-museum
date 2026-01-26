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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-4 pt-8">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <Disc3 className="h-5 w-5" />
                Music Museum
              </Link>
              <Link href="/genre/rock" className="text-sm text-muted-foreground hover:text-foreground">Rock</Link>
              <Link href="/genre/hip-hop" className="text-sm text-muted-foreground hover:text-foreground">Hip-Hop</Link>
              <Link href="/genre/electronic" className="text-sm text-muted-foreground hover:text-foreground">Electronic</Link>
              <Link href="/genre/jazz" className="text-sm text-muted-foreground hover:text-foreground">Jazz</Link>
              <Link href="/genre/rnb-soul" className="text-sm text-muted-foreground hover:text-foreground">R&B / Soul</Link>
              <Link href="/genre/pop" className="text-sm text-muted-foreground hover:text-foreground">Pop</Link>
              <Link href="/genre/metal" className="text-sm text-muted-foreground hover:text-foreground">Metal</Link>
              <Link href="/genre/folk-country" className="text-sm text-muted-foreground hover:text-foreground">Folk / Country</Link>
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
              <DropdownMenuItem onClick={() => router.push("/genre/rock")}>Rock</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/genre/hip-hop")}>Hip-Hop</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/genre/electronic")}>Electronic</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/genre/jazz")}>Jazz</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/genre/rnb-soul")}>R&B / Soul</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/genre/pop")}>Pop</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/genre/metal")}>Metal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/genre/folk-country")}>Folk / Country</DropdownMenuItem>
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
              <Button variant="ghost" size="icon" onClick={() => router.push("/library")}>
                <Library className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
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
