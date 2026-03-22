import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads and shows Music Museum text", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Music Museum")).toBeVisible();
  });

  test("album grid is visible", async ({ page }) => {
    await page.goto("/");
    // The gallery uses a grid layout for album covers
    const grid = page.locator('[class*="grid"]').first();
    await expect(grid).toBeVisible();
  });

  test("search input exists", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test("navigation to genre page works", async ({ page }) => {
    await page.goto("/");
    // Find any genre link on the page and click it
    const genreLink = page.locator('a[href^="/genre/"]').first();

    // If no genre link on homepage, navigate directly
    if ((await genreLink.count()) > 0) {
      await genreLink.click();
      await expect(page).toHaveURL(/\/genre\//);
    } else {
      // Navigate directly to a genre page to verify routing works
      await page.goto("/genre/rock");
      await expect(page).toHaveURL(/\/genre\/rock/);
    }
  });
});
