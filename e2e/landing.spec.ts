import { test, expect } from "@playwright/test";

// Landing page — 3-panel hover-expand (Actor / Data Engineer / Designer).
// Smoke test: the three panels are present with their roles + names visible.

test.describe("/ landing page", () => {
  test("renders three identity panels", async ({ page }) => {
    await page.goto("/");

    // Each panel exposes the role label as a paragraph and the name as an h2.
    await expect(page.getByText("Actor", { exact: true })).toBeVisible();
    await expect(page.getByText("Data Engineer", { exact: true })).toBeVisible();
    await expect(page.getByText("Designer", { exact: true })).toBeVisible();

    await expect(page.getByRole("heading", { name: "서해우", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hyunwoo Jee", level: 2 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Yuna Jee", level: 2 })).toBeVisible();
  });

  test("each panel links to its profile route", async ({ page }) => {
    await page.goto("/");
    const links = await page.getByRole("link").all();
    const hrefs = await Promise.all(links.map((l) => l.getAttribute("href")));
    // Panels link to /actor, /dev, /designer
    expect(hrefs).toEqual(expect.arrayContaining(["/actor", "/dev", "/designer"]));
  });
});
