import { test, expect } from "@playwright/test";

test.describe("/actor page", () => {
  test("hero, profile, filmography, gallery, contact all render", async ({ page }) => {
    await page.goto("/actor");

    // Hero — single h1 on the page
    await expect(page.locator("h1")).toContainText("서해우");
    // "Seo Haeu" appears twice: hero subtitle + "서해우 (Seo Haeu)" in the
    // about table. Use exact: true to match only the hero <p>.
    await expect(page.getByText("Seo Haeu", { exact: true })).toBeVisible();

    // Section headers (Korean). The SiteNav also shows "프로필", "필모그래피",
    // etc. as <a> links, so we scope to h2 specifically.
    for (const heading of ["프로필", "필모그래피", "갤러리", "연락처"]) {
      await expect(
        page.locator("h2").filter({ hasText: heading }),
      ).toBeVisible();
    }
  });

  test("filmography lists known credits", async ({ page }) => {
    await page.goto("/actor");
    // At least one well-known credit (Netflix series). Scope to filmography
    // section to avoid matching the nav link or hero label.
    const filmography = page.locator("#filmography");
    await expect(filmography.getByText("당신이 죽였다")).toBeVisible();
    await expect(filmography.getByText("Netflix").first()).toBeVisible();
  });

  test("hero image loads", async ({ page }) => {
    await page.goto("/actor");
    // Hero img has alt="서해우"; the about photo has alt="서해우 프로필".
    // Use first() to grab the hero one.
    const heroImg = page.locator('img[alt="서해우"]').first();
    await expect(heroImg).toBeVisible();
    const naturalWidth = await heroImg.evaluate(
      (img) => (img as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });
});
