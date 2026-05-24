export interface AffiliateConfig {
  merchbarAffiliateId?: string;
  amazonAssociateTag?: string;
}

export interface AffiliateLink {
  key: string;
  label: string;
  url: string;
  icon: "vinyl" | "amazon";
}

export function getAffiliateConfig(): AffiliateConfig {
  return {
    merchbarAffiliateId: process.env.MERCHBAR_AFFILIATE_ID || undefined,
    amazonAssociateTag: process.env.AMAZON_ASSOCIATE_TAG || undefined,
  };
}

export function buildAffiliateLinks(
  artistName: string,
  albumTitle: string,
  config: AffiliateConfig
): AffiliateLink[] {
  const links: AffiliateLink[] = [];
  const query = encodeURIComponent(`${artistName} ${albumTitle}`);

  if (config.merchbarAffiliateId) {
    links.push({
      key: "merchbar",
      label: "Buy on Vinyl",
      url: `https://www.merchbar.com/search?q=${query}&affiliate_id=${config.merchbarAffiliateId}`,
      icon: "vinyl",
    });
  }

  if (config.amazonAssociateTag) {
    links.push({
      key: "amazon",
      label: "Buy on Amazon",
      url: `https://www.amazon.com/s?k=${query}+vinyl&tag=${config.amazonAssociateTag}`,
      icon: "amazon",
    });
  }

  return links;
}
