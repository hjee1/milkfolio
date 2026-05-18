import { test, expect } from "@playwright/test";

test.describe("/dev page", () => {
  test("hero, sections, stack cards render", async ({ page }) => {
    await page.goto("/dev");

    // Hero h1 spans two lines
    await expect(page.locator("h1")).toContainText("Hyunwoo");
    await expect(page.locator("h1")).toContainText("Jee.");

    // Eyebrow tags + nav link "Data Engineer" both exist → use first()
    await expect(page.getByText("Data Engineer", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Hanwha System", { exact: true }).first()).toBeVisible();

    // Section labels — there's both a nav <a> and a section .labelText
    // for each. first() in DOM order is the nav link.
    for (const label of ["About", "Tech Stack", "Experience", "Contact"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test("stack cards include core engineering stack", async ({ page }) => {
    await page.goto("/dev");
    // Each skill name can appear in the hero chips, the stack card, and the
    // experience tags — scope to the stack section to disambiguate.
    const stack = page.locator("#stack");
    for (const skill of ["Apache Airflow", "Databricks", "Snowflake", "Python"]) {
      await expect(stack.getByText(skill, { exact: true })).toBeVisible();
    }
  });

  test("inline link to /actor profile", async ({ page }) => {
    await page.goto("/dev");
    const actorLink = page.locator('a[href="/actor"]').first();
    await expect(actorLink).toBeVisible();
  });
});
