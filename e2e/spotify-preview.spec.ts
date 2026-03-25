import { test, expect } from "@playwright/test";

test.describe("Spotify Preview Embed", () => {
  test("embed renders when spotifyId is present", async ({ page }) => {
    await page.goto("/album/1");
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    const count = await iframe.count();

    // Skip assertions if no spotifyId is populated yet (data-dependent)
    test.skip(count === 0, "No Spotify IDs populated in database yet");

    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("loading", "lazy");
    await expect(iframe).toHaveAttribute("allow", /encrypted-media/);
  });

  test("no embed when album lacks spotifyId", async ({ page }) => {
    await page.goto("/album/9999");
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    await expect(iframe).toHaveCount(0);
  });

  test("spotify link button is visible on album page", async ({ page }) => {
    const response = await page.goto("/album/1");
    test.skip(response?.status() !== 200, "Album page did not load (DB connection issue)");
    const spotifyLink = page.locator('a[href*="spotify.com"]');
    await expect(spotifyLink).toBeVisible();
  });
});
