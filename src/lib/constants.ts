export const IMPACT_TIERS = ["Landmark", "Essential", "Notable"] as const;
export type ImpactTier = (typeof IMPACT_TIERS)[number];

export const GENRE_COLORS: Record<string, string> = {
  rock: "#dc2626",
  "hip-hop": "#f59e0b",
  electronic: "#8b5cf6",
  jazz: "#3b82f6",
  "rnb-soul": "#ec4899",
  pop: "#f472b6",
  metal: "#1f2937",
  "indie-alternative": "#10b981",
  folk: "#92400e",
  classical: "#6366f1",
  country: "#d97706",
  reggae: "#16a34a",
  blues: "#2563eb",
  latin: "#ef4444",
  world: "#0891b2",
};

export const ITEMS_PER_PAGE = 60;

export const GENRES = [
  { slug: "rock", name: "Rock" },
  { slug: "hip-hop", name: "Hip-Hop" },
  { slug: "electronic", name: "Electronic" },
  { slug: "jazz", name: "Jazz" },
  { slug: "rnb-soul", name: "R&B / Soul" },
  { slug: "pop", name: "Pop" },
  { slug: "metal", name: "Metal" },
  { slug: "folk-country", name: "Folk / Country" },
] as const;

export const YEAR_RANGE = { min: 1950, max: new Date().getFullYear() } as const;

export const DECADES = [
  { label: "50s", min: 1950, max: 1959 },
  { label: "60s", min: 1960, max: 1969 },
  { label: "70s", min: 1970, max: 1979 },
  { label: "80s", min: 1980, max: 1989 },
  { label: "90s", min: 1990, max: 1999 },
  { label: "00s", min: 2000, max: 2009 },
  { label: "10s", min: 2010, max: 2019 },
  { label: "20s", min: 2020, max: 2029 },
] as const;

export const GALLERY_GRID_CLASSES = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2";

export const GALLERY_GRID_SMALL_CLASSES = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2";
