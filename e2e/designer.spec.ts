import { test, expect } from "@playwright/test";

test.describe("/designer page", () => {
  test("hero, about, work grid, contact render", async ({ page }) => {
    await page.goto("/designer");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Yuna");
    await expect(page.getByText("Design Portfolio 2026")).toBeVisible();
    await expect(page.getByText("Selected Work")).toBeVisible();
    await expect(page.getByText("Get in Touch")).toBeVisible();
  });

  test("project grid shows all 9 projects", async ({ page }) => {
    await page.goto("/designer");
    // Each project card is a <button> with an aria-label "Open {Title} project"
    const cards = page.getByRole("button", { name: /^Open .+ project$/ });
    await expect(cards).toHaveCount(9);
  });

  test("clicking a project opens the modal carousel", async ({ page }) => {
    await page.goto("/designer");
    await page.getByRole("button", { name: "Open PRISM project" }).click();

    // Modal heading appears
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText("PRISM");
    await expect(page.getByRole("dialog")).toContainText(
      "Precision Robot for Interactive Super Microsurgery",
    );

    // Close via the × button
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("modal arrow keys navigate carousel slides", async ({ page }) => {
    await page.goto("/designer");
    await page.getByRole("button", { name: "Open PRISM project" }).click();

    // Address dots by their aria-label — robust against CSS-module class hashing.
    const dot1 = page.getByRole("button", { name: "Go to image 1" });
    const dot2 = page.getByRole("button", { name: "Go to image 2" });
    await expect(dot1).toHaveClass(/dotActive/);

    await page.keyboard.press("ArrowRight");
    await expect(dot2).toHaveClass(/dotActive/);

    // Escape closes the modal.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
