import { Disc, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAffiliateLinks, getAffiliateConfig } from "@/lib/affiliate";

interface AffiliateLinksProps {
  artistName: string;
  albumTitle: string;
}

export function AffiliateLinks({ artistName, albumTitle }: AffiliateLinksProps) {
  const config = getAffiliateConfig();
  const links = buildAffiliateLinks(artistName, albumTitle, config);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button key={link.key} variant="outline" size="sm" asChild>
          <a href={link.url} target="_blank" rel="noopener noreferrer sponsored">
            {link.icon === "vinyl" ? (
              <Disc className="mr-1.5 h-3 w-3" />
            ) : (
              <ShoppingCart className="mr-1.5 h-3 w-3" />
            )}
            {link.label}
          </a>
        </Button>
      ))}
    </div>
  );
}
