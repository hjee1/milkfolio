import { test, expect } from "@playwright/test";

test.describe("/actor page", () => {
  test("hero, profile, filmography, gallery, contact all render", async ({ page }) => {
    await page.goto("/actor");

    // Hero
    await expect(page.getByRole("heading", { name: "서해우", level: 1 })).toBeVisible();
    await expect(page.getByText("Seo Haeu")).toBeVisible();

    // Section headers (Korean)
    await expect(page.getByRole("heading", { name: "프로필", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "필모그래피", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "갤러리", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "연락처", level: 2 })).toBeVisible();
  });

  test("filmography lists known credits", async ({ page }) => {
    await page.goto("/actor");
    // At least one well-known credit (Netflix series, 2025 단편)
    await expect(page.getByText("당신이 죽였다")).toBeVisible();
    await expect(page.getByText("Netflix")).toBeVisible();
  });

  test("hero image loads", async ({ page }) => {
    await page.goto("/actor");
    const heroImg = page.getByAltText("서해우").first();
    await expect(heroImg).toBeVisible();
    // naturalWidth > 0 means the browser actually loaded the file
    const naturalWidth = await heroImg.evaluate(
      (img) => (img as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });
});
