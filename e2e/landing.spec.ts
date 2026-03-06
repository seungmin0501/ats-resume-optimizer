import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders hero section and CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /analyze|이력서|履歴書|analizar/i }).first()).toBeVisible();
  });

  test("shows Sign in button when not logged in", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in|로그인|ログイン|iniciar/i })).toBeVisible();
  });

  test("locale switcher changes language", async ({ page }) => {
    await page.goto("/");
    // Switch to Korean
    await page.getByRole("button", { name: "한" }).first().click();
    await expect(page).toHaveURL(/\/ko/);
    // Switch back to English
    await page.getByRole("button", { name: "EN" }).first().click();
    await expect(page).toHaveURL(/\/en|^\//);
  });

  test("pricing section shows free and pro plans", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("$12")).toBeVisible();
  });

  test("footer links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /privacy/i }).click();
    await expect(page).toHaveURL(/\/privacy/);
  });
});
