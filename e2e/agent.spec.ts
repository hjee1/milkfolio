import { test, expect } from "@playwright/test";

// Agent dashboard — gate (password) → 5-section dashboard.
// The gate hash is the SHA-256 of "1314" (per current production setup).
const PASSWORD = "1314";

test.describe("/agent gate", () => {
  test("shows password input on first visit", async ({ page }) => {
    await page.goto("/agent");
    await expect(page.getByText("캐스팅 에이전트")).toBeVisible();
    await expect(page.getByPlaceholder("비밀번호")).toBeVisible();
  });

  test("wrong password shows error and stays on gate", async ({ page }) => {
    await page.goto("/agent");
    const input = page.getByPlaceholder("비밀번호");
    await input.fill("wrong-password");
    await input.press("Enter");
    await expect(page.getByText("잘못된 비밀번호입니다")).toBeVisible();
    // Dashboard nav must NOT appear
    await expect(page.getByText("지원 내역", { exact: true })).not.toBeVisible();
  });

  test("correct password reveals dashboard", async ({ page }) => {
    await page.goto("/agent");
    await page.getByPlaceholder("비밀번호").fill(PASSWORD);
    await page.getByPlaceholder("비밀번호").press("Enter");

    // Top nav appears with all 5 tabs in Korean
    await expect(page.getByRole("button", { name: "지원 내역" })).toBeVisible();
    await expect(page.getByRole("button", { name: "기간별 리포트" })).toBeVisible();
    await expect(page.getByRole("button", { name: "출처별" })).toBeVisible();
    await expect(page.getByRole("button", { name: "API 사용량" })).toBeVisible();
    await expect(page.getByRole("button", { name: "중복 감지" })).toBeVisible();
  });
});

test.describe("/agent dashboard (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed sessionStorage so we don't go through the gate every test.
    // The Korean comment is intentionally inside the init script — the gate
    // checks this exact key/value pair (see AgentClient.tsx line ~73).
    await page.addInitScript(() => {
      window.sessionStorage.setItem("agent_auth", "true");
    });
    await page.goto("/agent");
  });

  test("first section is 지원 내역 (MAIN)", async ({ page }) => {
    // The MAIN section heading has a gold left rule via CSS ::before, but the
    // text content is still just "지원 내역" — match the h2.
    const firstSection = page.locator("h2").first();
    await expect(firstSection).toContainText("지원 내역");
  });

  test("application cards render in a grid (page size 9 max)", async ({ page }) => {
    // Wait for data to load (Server Action returns parsed data.html).
    await page.waitForSelector("h2:has-text('지원 내역')");
    // Cards = articles OR links inside the cardGrid container.
    const cards = page.locator("[class*='castCard']");
    const count = await cards.count();
    // 0 if data.html is missing in CI, otherwise <=9 per page
    expect(count).toBeLessThanOrEqual(9);
  });

  test("period section uses 일간 / 월간 tabs only", async ({ page }) => {
    await page.waitForSelector("h2:has-text('기간별 리포트')");
    // The period tabs live right below the section heading.
    await expect(page.getByRole("button", { name: "일간" })).toBeVisible();
    await expect(page.getByRole("button", { name: "월간" })).toBeVisible();
    // Weekly was removed per user request.
    await expect(page.getByRole("button", { name: "주간" })).not.toBeVisible();
  });

  test("active period tab has explicit dark text on gold background", async ({ page }) => {
    await page.waitForSelector("h2:has-text('기간별 리포트')");
    const dailyTab = page.getByRole("button", { name: "일간" });
    // The active class applies font-weight 700 and color #0a0a0a — assert via
    // computed style to lock in the readability fix from this iteration.
    const color = await dailyTab.evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe("rgb(10, 10, 10)");
  });

  test("card click opens detail modal; external link is separate", async ({ page }) => {
    await page.waitForSelector("h2:has-text('지원 내역')");
    const cards = page.locator("[class*='castCard']");
    const count = await cards.count();
    test.skip(count === 0, "no data.html rows in this environment");

    // Cards are now <button>s (detail-first), never direct external links.
    await expect(cards.first()).toHaveJSProperty("tagName", "BUTTON");

    await cards.first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // The external link (or its absence note) lives inside the modal only.
    const linkOrNote = dialog
      .getByRole("link", { name: /원본 공고 열기/ })
      .or(dialog.getByText("원본 공고 URL이 수집되지 않은 항목입니다."));
    await expect(linkOrNote.first()).toBeVisible();

    // ESC closes and returns to the grid.
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("logout returns to gate", async ({ page }) => {
    await page.waitForSelector("h2:has-text('지원 내역')");
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page.getByPlaceholder("비밀번호")).toBeVisible();
  });
});
