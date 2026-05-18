import { test, expect } from "@playwright/test";

test.describe("/dev page", () => {
  test("hero, sections, stack cards render", async ({ page }) => {
    await page.goto("/dev");

    // Hero name (rendered across two spans inside the h1)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hyunwoo");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Jee.");

    // Eyebrow tags
    await expect(page.getByText("Data Engineer", { exact: true })).toBeVisible();
    await expect(page.getByText("Hanwha System", { exact: true })).toBeVisible();

    // Section labels (kept as English on the dev page)
    await expect(page.getByText("About", { exact: true })).toBeVisible();
    await expect(page.getByText("Tech Stack")).toBeVisible();
    await expect(page.getByText("Experience", { exact: true })).toBeVisible();
    await expect(page.getByText("Contact", { exact: true })).toBeVisible();
  });

  test("stack cards include core engineering stack", async ({ page }) => {
    await page.goto("/dev");
    // Stack covers all 6 categories. Spot-check 4 representative skills.
    for (const skill of ["Apache Airflow", "Databricks", "Snowflake", "Python"]) {
      await expect(page.getByText(skill, { exact: true })).toBeVisible();
    }
  });

  test("inline link to /actor profile", async ({ page }) => {
    await page.goto("/dev");
    const actorLink = page.locator('a[href="/actor"]').first();
    await expect(actorLink).toBeVisible();
  });
});
