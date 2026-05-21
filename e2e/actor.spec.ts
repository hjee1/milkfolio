import { test, expect } from "@playwright/test";

test.describe("/actor page", () => {
  // TODO Phase 2: 새 Profile 섹션이 들어오면 h1은 Cormorant `S E O   H A E U`로
  // 변경되고 한국어 `서해우`는 부제 <p>로 이동한다. 그 시점에 이 테스트의
  // expectation을 새 구조에 맞춰 재작성한다.
  test.skip("hero, profile, filmography, gallery, contact all render", async ({ page }) => {
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

  // TODO Phase 2: Phase 1에서 Hero는 HeroReel 컴포넌트(자체 alt 텍스트)로 교체된다.
  // 기존 `alt="서해우"` 단일 hero <img>는 더 이상 존재하지 않는다. Phase 2에서
  // Profile portrait이 들어오면 그때 새 alt 규칙에 맞춰 이 테스트를 갱신한다.
  test.skip("hero image loads", async ({ page }) => {
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

// ────────────────────────────────────────────────────────────────────
// Phase 1: 비주얼 시스템 + Hero shell 회귀
// SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-003/U-004/U-009/U-011, E-001/E-006, S-001
// 풀파워 재설계의 Hero 영역 (carbon + Cormorant + bridge)이 만족되었는지 확인.
// 기타 섹션(Profile/Reel/Roles 등)은 Phase 2+에서 추가되며 그때 회귀가 확장된다.
// ────────────────────────────────────────────────────────────────────
test.describe("hero v2 (Phase 1)", () => {
  test("hero displays Cormorant H1 with Seo Haeu letters", async ({ page }) => {
    await page.goto("/actor");
    // 새 Hero의 h1은 Cormorant `S E O   H A E U` (letter-spaced). DOM text는
    // 자간 공백이 포함되지만 정규화한 문자열에는 SEOHAEU가 포함된다.
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const raw = (await h1.textContent()) ?? "";
    const normalized = raw.replace(/\s+/g, "").toUpperCase();
    expect(normalized).toContain("SEOHAEU");
  });

  test("hero displays 서해우 Korean subtitle", async ({ page }) => {
    await page.goto("/actor");
    const hero = page.locator('section[aria-label="Hero"]');
    await expect(hero.getByText("서해우")).toBeVisible();
  });

  test("hero displays 'Actor since 2023' eyebrow", async ({ page }) => {
    await page.goto("/actor");
    const hero = page.locator('section[aria-label="Hero"]');
    await expect(hero.getByText(/Actor since 2023/i)).toBeVisible();
  });

  test("hero→body bridge has height between 60 and 100px (REQ-ACT-U-009)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const bridge = page.locator("[data-hero-bridge]");
    await expect(bridge).toHaveCount(1);
    const height = await bridge.evaluate(
      (el) => el.getBoundingClientRect().height,
    );
    expect(height).toBeGreaterThanOrEqual(60);
    expect(height).toBeLessThanOrEqual(100);
  });

  test("hero background is carbon, body background is off-white", async ({
    page,
  }) => {
    await page.goto("/actor");
    const hero = page.locator('section[aria-label="Hero"]');
    const heroBg = await hero.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    // carbon (#0a0a0a) → rgb(10, 10, 10)
    expect(heroBg).toMatch(/rgb\(10,\s*10,\s*10\)/);

    // bridge 다음 첫 본문 컨테이너의 배경이 off-white(#f8f5f0)
    const body = page.locator("[data-actor-body]");
    await expect(body).toHaveCount(1);
    const bodyBg = await body.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bodyBg).toMatch(/rgb\(248,\s*245,\s*240\)/);
  });

  test("hero displays Netflix lineup hint (REQ-ACT-E-001)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const hero = page.locator('section[aria-label="Hero"]');
    await expect(hero.getByText(/Netflix/)).toBeVisible();
    await expect(hero.getByText(/당신이 죽였다/)).toBeVisible();
  });

  test("reduced-motion: hero video has no active autoplay (REQ-ACT-S-001)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/actor");
    // Phase 1에서 reelUrl이 비어 있을 때도 <video> 요소는 마크업에 예약됨
    // (REQ-ACT-O-001). reduced-motion 환경에서는 autoplay 속성이 false이거나
    // video가 일시정지 상태여야 한다.
    const video = page.locator('section[aria-label="Hero"] video');
    if ((await video.count()) > 0) {
      const isAutoplay = await video.first().evaluate(
        (el) => (el as HTMLVideoElement).autoplay,
      );
      const isPaused = await video.first().evaluate(
        (el) => (el as HTMLVideoElement).paused,
      );
      // reelUrl이 비어 있으면 src도 없으므로 paused여야 정상.
      expect(isAutoplay === false || isPaused === true).toBeTruthy();
    }
  });
});
