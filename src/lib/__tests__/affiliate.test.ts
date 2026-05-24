import { describe, it, expect } from "vitest";
import { buildAffiliateLinks, AffiliateConfig } from "@/lib/affiliate";

describe("buildAffiliateLinks", () => {
  const artist = "Radiohead";
  const album = "OK Computer";

  it("returns empty array when no config is provided", () => {
    const result = buildAffiliateLinks(artist, album, {});
    expect(result).toEqual([]);
  });

  it("returns only Merchbar link when only merchbarAffiliateId is set", () => {
    const config: AffiliateConfig = { merchbarAffiliateId: "mm-123" };
    const result = buildAffiliateLinks(artist, album, config);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("merchbar");
    expect(result[0].label).toBe("Buy on Vinyl");
    expect(result[0].icon).toBe("vinyl");
  });

  it("returns only Amazon link when only amazonAssociateTag is set", () => {
    const config: AffiliateConfig = { amazonAssociateTag: "mm-20" };
    const result = buildAffiliateLinks(artist, album, config);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("amazon");
    expect(result[0].label).toBe("Buy on Amazon");
    expect(result[0].icon).toBe("amazon");
  });

  it("returns both links when both are configured", () => {
    const config: AffiliateConfig = {
      merchbarAffiliateId: "mm-123",
      amazonAssociateTag: "mm-20",
    };
    const result = buildAffiliateLinks(artist, album, config);
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.key)).toEqual(["merchbar", "amazon"]);
  });

  it("Merchbar URL contains affiliate_id param", () => {
    const config: AffiliateConfig = { merchbarAffiliateId: "mm-123" };
    const result = buildAffiliateLinks(artist, album, config);
    const url = new URL(result[0].url);
    expect(url.searchParams.get("affiliate_id")).toBe("mm-123");
    expect(url.searchParams.get("q")).toBe("Radiohead OK Computer");
  });

  it("Amazon URL contains tag param and vinyl keyword", () => {
    const config: AffiliateConfig = { amazonAssociateTag: "mm-20" };
    const result = buildAffiliateLinks(artist, album, config);
    const url = new URL(result[0].url);
    expect(url.searchParams.get("tag")).toBe("mm-20");
    expect(url.searchParams.get("k")).toContain("vinyl");
    expect(url.searchParams.get("k")).toContain("Radiohead OK Computer");
  });

  it("encodes special characters in artist and album names", () => {
    const config: AffiliateConfig = { merchbarAffiliateId: "test" };
    const result = buildAffiliateLinks("AC/DC", "Back in Black", config);
    expect(result[0].url).toContain(encodeURIComponent("AC/DC Back in Black"));
  });

  it("handles unicode characters", () => {
    const config: AffiliateConfig = { merchbarAffiliateId: "test" };
    const result = buildAffiliateLinks("Beyoncé", "Lemonade", config);
    expect(result[0].url).toContain(encodeURIComponent("Beyoncé Lemonade"));
  });
});
