import { test, expect } from "@playwright/test";

// /designer — brutalist white redesign (2026-07, commit be3191b).
// Rewritten 2026-08-21: the previous suite targeted the pre-redesign page
// ("Design Portfolio 2026" copy, "Open {Title} project" labels, image-dot
// carousel) — none of which exist on the shipped page.

test.describe("/designer page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/designer");
  });

  test("nav, hero, work and contact sections render", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Making a",
    );
    await expect(page.getByText("Yuna Jee").first()).toBeVisible();
    await expect(page.getByText("Selected Work")).toBeVisible();
    await expect(page.getByText("Get in Touch")).toBeVisible();
  });

  test("project index lists all 10 project frames", async ({ page }) => {
    const frames = page.getByRole("button", { name: /^Open / });
    await expect(frames).toHaveCount(10);
  });

  test("clicking a project opens the full-screen detail view", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /^Open / }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#detail-title")).toBeVisible();
    await expect(dialog.getByText(/^\d{2} \/ \d{2}$/)).toBeVisible();

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("arrow keys switch projects; Escape closes", async ({ page }) => {
    await page.getByRole("button", { name: /^Open / }).first().click();
    const title = page.locator("#detail-title");
    await expect(title).toBeVisible();
    const first = (await title.textContent()) ?? "";

    await page.keyboard.press("ArrowRight");
    await expect(title).not.toHaveText(first);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
