import { test, expect } from "@playwright/test";

test.describe("Auth Pages", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.getByText("Sign in to your account")).toBeVisible();
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
  });

  test("sign-in form has email, password, and submit", async ({ page }) => {
    await page.goto("/auth/signin");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.getByRole("button", { name: /sign in/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("sign-up form has name, email, password, and submit", async ({ page }) => {
    await page.goto("/auth/signup");

    const nameInput = page.locator('input[type="text"]');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.getByRole("button", { name: /create account/i });

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("sign-in page has link to sign-up", async ({ page }) => {
    await page.goto("/auth/signin");
    const signUpLink = page.getByRole("link", { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/auth/signup");
  });

  test("sign-up page has link to sign-in", async ({ page }) => {
    await page.goto("/auth/signup");
    const signInLink = page.getByRole("link", { name: /sign in/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/auth/signin");
  });
});
