import { test, expect } from "@playwright/test";

// /dev — SPEC-DEV-REDESIGN-001 4-section page (Hero / Now / Experience / Footer).
// Rewritten 2026-08-21: the previous 3-test suite targeted the pre-redesign
// page (#stack, "About", "Tech Stack") and even asserted a visible /actor
// link — the exact opposite of REQ-DEV-N-004 (persona separation, zero
// cross-links between /dev and /actor).

test.describe("/dev page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dev");
  });

  test("hero renders identity and current title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Hyunwoo");
    await expect(page.locator("h1")).toContainText("Jee.");
    // Title appears in the hero eyebrow and again in the Experience timeline.
    await expect(
      page.getByText("AI Technical Engineer", { exact: true }).first(),
    ).toBeVisible();
  });

  test("nav anchors point at the three sections", async ({ page }) => {
    for (const id of ["now", "experience", "contact"]) {
      await expect(page.locator(`nav a[href="#${id}"]`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test("experience timeline shows both career chapters", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "AI Technical Engineer", exact: true }),
    ).toBeVisible();
    // exact — the WhatIDo h2 ("Not a data engineer anymore.") would otherwise
    // also match and trip Playwright strict mode.
    await expect(
      page.getByRole("heading", { name: "Data Engineer", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Hanwha Systems").first()).toBeVisible();
  });

  test("persona separation — zero /actor links (REQ-DEV-N-004)", async ({
    page,
  }) => {
    await expect(page.locator('a[href^="/actor"]')).toHaveCount(0);
  });

  test("agent ticker and reflex test are mounted", async ({ page }) => {
    await expect(page.getByText("agent · live")).toBeVisible();
    await expect(page.getByText("reflex test")).toBeVisible();
  });
});
