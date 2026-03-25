import { test, expect } from "@playwright/test";

test.describe("Spotify Preview Embed", () => {
  test("embed visible on album page with spotifyId", async ({ page }) => {
    await page.goto("/album/1");
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    await expect(iframe).toBeVisible();
  });

  test("embed has correct attributes", async ({ page }) => {
    await page.goto("/album/1");
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    await expect(iframe).toHaveAttribute("loading", "lazy");
    await expect(iframe).toHaveAttribute("allow", /encrypted-media/);
  });

  test("no embed when album lacks spotifyId", async ({ page }) => {
    // Navigate to a non-existent or high-numbered album that lacks a spotifyId.
    // This test assumes such an album exists; adjust the ID if needed.
    await page.goto("/album/9999");
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    await expect(iframe).toHaveCount(0);
  });

  test("embed and link buttons coexist", async ({ page }) => {
    await page.goto("/album/1");
    const iframe = page.locator('iframe[src*="open.spotify.com/embed"]');
    await expect(iframe).toBeVisible();
    const spotifyLink = page.getByRole("link", { name: /spotify/i });
    await expect(spotifyLink).toBeVisible();
  });
});
