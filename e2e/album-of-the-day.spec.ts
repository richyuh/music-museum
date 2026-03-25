import { test, expect } from "@playwright/test";

test.describe("Album of the Day", () => {
  test("shows Today button in filter bar on homepage", async ({ page }) => {
    await page.goto("/");

    const todayButton = page.getByRole("button", { name: /album of the day/i });
    await expect(todayButton).toBeVisible();
    await expect(todayButton).toHaveText(/Today/);
  });

  test("Today button navigates to album detail page", async ({ page }) => {
    await page.goto("/");

    const todayButton = page.getByRole("button", { name: /album of the day/i });
    await expect(todayButton).toBeVisible();
    await todayButton.click();

    await expect(page).toHaveURL(/\/album\/\d+/);
  });

  test("album detail page shows Album of the Day badge", async ({ page }) => {
    await page.goto("/");

    const todayButton = page.getByRole("button", { name: /album of the day/i });
    await expect(todayButton).toBeVisible();
    await todayButton.click();

    await expect(page).toHaveURL(/\/album\/\d+/);

    const badge = page.getByText("Album of the Day");
    await expect(badge).toBeVisible();
  });

  test("Today button leads to same album on reload", async ({ page }) => {
    await page.goto("/");

    const todayButton = page.getByRole("button", { name: /album of the day/i });
    await todayButton.click();
    await expect(page).toHaveURL(/\/album\/\d+/);
    const url1 = page.url();

    await page.goto("/");
    const todayButton2 = page.getByRole("button", { name: /album of the day/i });
    await todayButton2.click();
    await expect(page).toHaveURL(/\/album\/\d+/);
    const url2 = page.url();

    expect(url1).toBe(url2);
  });
});
