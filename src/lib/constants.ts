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
