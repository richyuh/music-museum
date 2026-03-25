import { test, expect } from "@playwright/test";

test.describe("Album of the Day", () => {
  test("displays album of the day section on homepage", async ({ page }) => {
    await page.goto("/");

    // Look for the Album of the Day section
    const section = page.getByText(/album of the day/i);
    await expect(section).toBeVisible();

    // Verify it contains a cover image
    const coverImage = page.locator('img[alt*="cover"]').first();
    await expect(coverImage).toBeVisible();

    // Verify album title is present (heading within the section)
    const heading = page
      .locator("section")
      .filter({ hasText: /album of the day/i })
      .locator("h2, h3")
      .first();
    await expect(heading).toBeVisible();
    const titleText = await heading.textContent();
    expect(titleText?.length).toBeGreaterThan(0);

    // Verify artist name is present
    const artistText = page
      .locator("section")
      .filter({ hasText: /album of the day/i })
      .getByText(/.+/)
      .filter({ hasNotText: /album of the day/i });
    expect(await artistText.count()).toBeGreaterThan(0);

    // Verify summary text is present (longer text block)
    const summary = page
      .locator("section")
      .filter({ hasText: /album of the day/i })
      .locator("p");
    expect(await summary.count()).toBeGreaterThan(0);
  });

  test("album of the day links to album detail page", async ({ page }) => {
    await page.goto("/");

    // Find and click the "View full exhibit" link within the Album of the Day section
    const viewLink = page.getByRole("link", { name: /view full exhibit/i });
    await expect(viewLink).toBeVisible();
    await viewLink.click();

    // Verify navigation to /album/[id]
    await expect(page).toHaveURL(/\/album\/\d+/);
  });

  test("shows same album on page reload", async ({ page }) => {
    await page.goto("/");

    // Get the album title text from the Album of the Day section
    const heading = page
      .locator("section")
      .filter({ hasText: /album of the day/i })
      .locator("h2, h3")
      .first();
    await expect(heading).toBeVisible();
    const titleBefore = await heading.textContent();

    // Reload the page
    await page.reload();

    // Verify the same album title appears (deterministic selection)
    const headingAfter = page
      .locator("section")
      .filter({ hasText: /album of the day/i })
      .locator("h2, h3")
      .first();
    await expect(headingAfter).toBeVisible();
    const titleAfter = await headingAfter.textContent();
    expect(titleAfter).toBe(titleBefore);
  });
});
