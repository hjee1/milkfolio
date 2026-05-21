import { test, expect } from "@playwright/test";

// ────────────────────────────────────────────────────────────────────
// /actor 페이지 회귀 테스트
// SPEC-ACTOR-REDESIGN-001
//
// Phase 1: hero v2 — carbon Hero / Cormorant H1 / bridge / lineup hint
// Phase 2: profile + filmography — 매거진 그리드 + 6작품 정확성 + 페르소나 분리
// ────────────────────────────────────────────────────────────────────

test.describe("/actor page (top-level smoke)", () => {
  // Phase 2: h1은 Hero가 단독 보유. Profile은 h2 사용 (Phase 0+1 인계 결정 LD1).
  test("hero h1 단독 + Profile/Filmography h2 렌더", async ({ page }) => {
    await page.goto("/actor");

    // Hero only owns h1. 큰 영문 H1 `S E O   H A E U`만 존재.
    await expect(page.locator("h1")).toHaveCount(1);
    const h1Text = ((await page.locator("h1").textContent()) ?? "")
      .replace(/\s+/g, "")
      .toUpperCase();
    expect(h1Text).toContain("SEOHAEU");

    // Profile + Filmography 섹션은 h2를 가진다. 갤러리는 제거됨.
    // Profile h2는 영문 매거진 헤드라인 "Seo Haeu" — 한국어 "프로필"은
    // eyebrow(<p>)로 표시되며 h2는 영문이다 (LD1 결정 + 매거진 톤).
    // Filmography h2는 한국어 "필모그래피".
    // (SiteNav도 "프로필" 라벨을 <a>로 가지므로 h2에 한정해 확인한다.)
    await expect(
      page.locator("section#profile h2").filter({ hasText: /Seo\s*Haeu/i }),
    ).toBeVisible();
    await expect(
      page.locator("h2").filter({ hasText: "필모그래피" }),
    ).toBeVisible();
  });

  test("Filmography lists known credits (Netflix · 당신이 죽였다)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const filmography = page.locator("section#filmography");
    await expect(filmography.getByText("당신이 죽였다")).toBeVisible();
    await expect(filmography.getByText("Netflix").first()).toBeVisible();
  });

  // Phase 2에서 hero <img>는 alt=""(decorative)이고 Profile에 의미있는 portrait
  // <img>가 들어온다. 새 portrait가 정상 로드되는지 검증한다.
  test("Profile portrait image loads", async ({ page }) => {
    await page.goto("/actor");
    const portraitImg = page.locator("section#profile img").first();
    await expect(portraitImg).toBeVisible();
    const naturalWidth = await portraitImg.evaluate(
      (img) => (img as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────────────────────────────
// Phase 1: 비주얼 시스템 + Hero shell 회귀
// SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-003/U-004/U-009/U-011, E-001/E-006, S-001
// ────────────────────────────────────────────────────────────────────
test.describe("hero v2 (Phase 1)", () => {
  test("hero displays Cormorant H1 with Seo Haeu letters", async ({ page }) => {
    await page.goto("/actor");
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
    expect(heroBg).toMatch(/rgb\(10,\s*10,\s*10\)/);

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
    const video = page.locator('section[aria-label="Hero"] video');
    if ((await video.count()) > 0) {
      const isAutoplay = await video.first().evaluate(
        (el) => (el as HTMLVideoElement).autoplay,
      );
      const isPaused = await video.first().evaluate(
        (el) => (el as HTMLVideoElement).paused,
      );
      expect(isAutoplay === false || isPaused === true).toBeTruthy();
    }
  });
});

// ────────────────────────────────────────────────────────────────────
// Phase 2: Profile + Filmography (서버 렌더)
// SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001/U-002/U-006/U-008/U-011/U-012,
// REQ-ACT-N-004/N-005/N-008
// ────────────────────────────────────────────────────────────────────
test.describe("profile + filmography (Phase 2)", () => {
  test("profile section renders Korean and English names", async ({ page }) => {
    await page.goto("/actor");
    const profile = page.locator("section#profile");
    await expect(profile).toBeVisible();
    // 영문 이름 (Cormorant H2 또는 인접 표기)
    await expect(profile.getByText(/Seo\s*Haeu/i).first()).toBeVisible();
    // 한국어 이름
    await expect(profile.getByText("서해우").first()).toBeVisible();
  });

  test("profile portrait <img> loads with meaningful alt", async ({ page }) => {
    await page.goto("/actor");
    const portrait = page.locator("section#profile img").first();
    await expect(portrait).toBeVisible();
    const alt = (await portrait.getAttribute("alt")) ?? "";
    expect(alt.length).toBeGreaterThan(0);
    const naturalWidth = await portrait.evaluate(
      (img) => (img as HTMLImageElement).naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test("profile table contains key info (1994.04.18, 180cm, terryjhw@gmail.com)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const profile = page.locator("section#profile");
    await expect(profile).toContainText("1994.04.18");
    await expect(profile).toContainText(/180\s*cm/);
    await expect(profile).toContainText("terryjhw@gmail.com");
  });

  test("profile section does NOT expose 학력/IIT/Computer Science (REQ-ACT-N-004)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const profile = page.locator("section#profile");
    const text = (await profile.textContent()) ?? "";
    expect(text).not.toMatch(/IIT/i);
    expect(text).not.toMatch(/Illinois Institute of Technology/i);
    expect(text).not.toMatch(/Computer Science/i);
    expect(text).not.toMatch(/학력/);
  });

  test("filmography category labels (드라마 / 영화 / 뮤지컬) render", async ({
    page,
  }) => {
    await page.goto("/actor");
    const filmography = page.locator("section#filmography");
    await expect(filmography.getByText("드라마", { exact: true })).toBeVisible();
    await expect(filmography.getByText("영화", { exact: true })).toBeVisible();
    await expect(filmography.getByText("뮤지컬", { exact: true })).toBeVisible();
  });

  test("filmography lists exactly 6 works (REQ-ACT-U-006 / acceptance H1)", async ({
    page,
  }) => {
    await page.goto("/actor");
    await expect(
      page.locator("section#filmography [data-filmo-entry]"),
    ).toHaveCount(6);
  });

  test("filmography contains corrected character names (점원 / 대현 / 집주인 / 국현 / 민혁 / 준혁)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const filmography = page.locator("section#filmography");
    for (const name of ["점원", "대현", "집주인", "국현", "민혁", "준혁"]) {
      await expect(filmography.getByText(name).first()).toBeVisible();
    }
  });

  test("filmography contains the 6 work titles", async ({ page }) => {
    await page.goto("/actor");
    const filmography = page.locator("section#filmography");
    const titles = [
      "너만 있으면",
      "당신이 죽였다",
      "그래도 사랑이었다",
      "요즘것들",
      "어느날 엄마가 봉투를 썼다",
      "눈",
    ];
    for (const t of titles) {
      await expect(filmography.getByText(t).first()).toBeVisible();
    }
  });

  test("filmography does NOT contain prohibited works (REQ-ACT-N-005 / H2)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const filmography = page.locator("section#filmography");
    for (const banned of [
      "사랑하거나 말거나",
      "단절",
      "오르골",
      "오르골들",
      "매장직원",
    ]) {
      await expect(filmography).not.toContainText(banned);
    }
  });

  test("body main does not contain prohibited persona substrings (REQ-ACT-N-004 / H3)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const main = page.locator("main");
    // main이 존재하지 않을 수 있으므로 fallback으로 body에서 nav/footer를 제외한
    // 텍스트로 검증한다. milkfolio는 page.tsx 최상위에 <main>이 없으므로 우선
    // [data-actor-body] 내부에서 nav/footer를 제외한 부분을 잡는다.
    const bodyCount = await page.locator("[data-actor-body]").count();
    expect(bodyCount).toBe(1);
    // SiteNav는 [data-actor-body] 내부에 있으므로 본문 검증에서는 nav 영역을
    // 제외해야 한다. 본문 컨테이너 직속 section들의 텍스트만 추출한다.
    const mainText =
      (await page
        .locator("[data-actor-body] > section")
        .allTextContents()) ?? [];
    const joined = mainText.join("\n");
    const banned = [
      "IIT",
      "Illinois Institute of Technology",
      "Computer Science",
      "Hanwha",
      "한화시스템",
      "한화 시스템",
      "AI Technical Engineer",
      "AI Engineer",
      "Data Engineer",
      "Hyunwoo Jee",
      "지현우",
      // 'Terry'는 case-insensitive grep이지만 'terry'는 이메일 'terryjhw'에
      // 포함되므로 단어 경계로 한정한다. acceptance H3는 substring 검색이지만
      // 'terryjhw@gmail.com'에서 substring 'terry'가 잡히면 이메일을 노출할 수
      // 없어진다 — 이메일은 합리적 캐스팅 contact이므로 word boundary로 검증.
      // (acceptance H3의 의도는 페르소나 호명이지 이메일 차단이 아니다.)
      // word boundary 검증은 별도 케이스에서 처리하지 않고 main에서 제거.
      "developer",
      "engineer",
      "엔지니어",
    ];
    const lower = joined.toLowerCase();
    for (const s of banned) {
      expect(lower).not.toContain(s.toLowerCase());
    }
    // Terry는 word boundary로 별도 검증 (이메일은 OK)
    expect(joined).not.toMatch(/\bTerry\b/);

    // 본문 내 /dev 라우팅 링크 0건
    const devLinks = await page
      .locator("[data-actor-body] > section a[href^='/dev']")
      .count();
    expect(devLinks).toBe(0);
  });

  test("filmography uses no emoji glyphs (REQ-ACT-N-008)", async ({ page }) => {
    await page.goto("/actor");
    const filmography = page.locator("section#filmography");
    const text = (await filmography.textContent()) ?? "";
    // ✉ / 📷 등 emoji 글리프 0건. 정규식은 SMP 영역 + Misc Symbols+Arrows.
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    expect(text).not.toMatch(/[✀-➿]/);
    expect(text).not.toMatch(/[☀-⛿]/);
  });

  test("profile uses no emoji glyphs (REQ-ACT-N-008)", async ({ page }) => {
    await page.goto("/actor");
    const profile = page.locator("section#profile");
    const text = (await profile.textContent()) ?? "";
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    expect(text).not.toMatch(/[✀-➿]/);
    expect(text).not.toMatch(/[☀-⛿]/);
  });
});
