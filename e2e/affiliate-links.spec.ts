import { test, expect } from "@playwright/test";

test.describe("Affiliate Links", () => {
  test("Buy on Vinyl link is visible when configured", async ({ page }) => {
    await page.goto("/album/1");
    const vinylLink = page.getByRole("link", { name: /buy on vinyl/i });
    const count = await vinylLink.count();

    test.skip(count === 0, "MERCHBAR_AFFILIATE_ID not configured");

    await expect(vinylLink).toBeVisible();
    await expect(vinylLink).toHaveAttribute("target", "_blank");
    await expect(vinylLink).toHaveAttribute("rel", /sponsored/);
    await expect(vinylLink).toHaveAttribute("href", /merchbar\.com/);
    await expect(vinylLink).toHaveAttribute("href", /affiliate_id=/);
  });

  test("Buy on Amazon link is visible when configured", async ({ page }) => {
    await page.goto("/album/1");
    const amazonLink = page.getByRole("link", { name: /buy on amazon/i });
    const count = await amazonLink.count();

    test.skip(count === 0, "AMAZON_ASSOCIATE_TAG not configured");

    await expect(amazonLink).toBeVisible();
    await expect(amazonLink).toHaveAttribute("target", "_blank");
    await expect(amazonLink).toHaveAttribute("rel", /sponsored/);
    await expect(amazonLink).toHaveAttribute("href", /amazon\.com/);
    await expect(amazonLink).toHaveAttribute("href", /tag=/);
  });

  test("affiliate links do not appear on invalid album page", async ({ page }) => {
    await page.goto("/album/9999");
    const vinylLink = page.getByRole("link", { name: /buy on vinyl/i });
    const amazonLink = page.getByRole("link", { name: /buy on amazon/i });
    await expect(vinylLink).toHaveCount(0);
    await expect(amazonLink).toHaveCount(0);
  });
});
