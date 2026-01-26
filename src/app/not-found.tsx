import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This exhibit is not in our collection.
        </p>
        <Button asChild>
          <Link href="/">Return to the Gallery</Link>
        </Button>
      </div>
    </div>
  );
}
