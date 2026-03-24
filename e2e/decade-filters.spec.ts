import { test, expect } from "@playwright/test";

test.describe("Decade Filter Buttons", () => {
  test("decade buttons are visible on homepage", async ({ page }) => {
    await page.goto("/");
    for (const label of ["50s", "60s", "70s", "80s", "90s", "00s", "10s", "20s"]) {
      await expect(page.getByRole("button", { name: `Filter by ${label}` })).toBeVisible();
    }
  });

  test("clicking a decade filters by year range", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Filter by 70s" }).click();
    await expect(page).toHaveURL(/yearMin=1970/);
    await expect(page).toHaveURL(/yearMax=1979/);
    // Album grid should still be visible
    const grid = page.locator('[class*="grid"]').first();
    await expect(grid).toBeVisible();
  });

  test("clicking active decade clears the filter", async ({ page }) => {
    await page.goto("/?yearMin=1970&yearMax=1979");
    await page.getByRole("button", { name: "Filter by 70s" }).click();
    await expect(page).not.toHaveURL(/yearMin/);
    await expect(page).not.toHaveURL(/yearMax/);
  });

  test("decade button reflects active state from URL", async ({ page }) => {
    await page.goto("/?yearMin=1980&yearMax=1989");
    const button = page.getByRole("button", { name: "Filter by 80s" });
    await expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("clear filters resets decade selection", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Filter by 90s" }).click();
    await expect(page).toHaveURL(/yearMin=1990/);
    // Click the Clear button
    await page.getByRole("button", { name: /clear/i }).click();
    await expect(page).not.toHaveURL(/yearMin/);
    await expect(page).not.toHaveURL(/yearMax/);
    // 90s button should no longer be active
    const button = page.getByRole("button", { name: "Filter by 90s" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
  });
});
