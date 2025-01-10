import { test, expect } from "@playwright/test";

test("Application title should be correct", async ({ page }) => {
  await page.goto("/gallery");
  await expect(page).toHaveTitle(
    "Cloudflare App with Astro | Atyantik Technologies",
  );
});
