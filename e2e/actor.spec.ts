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

// ────────────────────────────────────────────────────────────────────
// Phase 3: Reel (server shell + client tabs + skeleton)
// SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001/U-005/U-011, REQ-ACT-E-002/E-003/E-007,
// REQ-ACT-S-002/S-003, REQ-ACT-O-001/O-002/O-004, REQ-ACT-N-001/N-002/N-008
// ────────────────────────────────────────────────────────────────────
test.describe("reel (Phase 3)", () => {
  // B0 smoke: 섹션 존재 + h1 단독 유지 + Reel h2 도착
  test("B0: <section id='reel'> exists, h1 count remains 1, Reel h2 present", async ({
    page,
  }) => {
    await page.goto("/actor");
    await expect(page.locator("section#reel")).toHaveCount(1);
    // Hero가 h1 단독 보유. Phase 3 도입 후에도 h1은 1개여야 한다.
    await expect(page.locator("h1")).toHaveCount(1);
    // Reel section은 자체 h2를 가진다.
    await expect(
      page.locator("section#reel h2").first(),
    ).toBeVisible();
  });

  // B1 mouse tab: Intro 기본 활성, Scene 클릭 → aria-selected 전환
  test("B1: Intro tab is selected by default; clicking Scene activates it", async ({
    page,
  }) => {
    await page.goto("/actor");
    const introTab = page
      .locator("section#reel [role='tab']")
      .filter({ hasText: "Intro" });
    const sceneTab = page
      .locator("section#reel [role='tab']")
      .filter({ hasText: "Scene" });
    await expect(introTab).toHaveAttribute("aria-selected", "true");
    await sceneTab.click();
    await expect(sceneTab).toHaveAttribute("aria-selected", "true");
    await expect(introTab).toHaveAttribute("aria-selected", "false");
  });

  // B2 keyboard: ArrowRight/Home/End 순환
  test("B2: ArrowRight cycles tabs; Home/End jump to ends (WAI-ARIA tabs)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const introTab = page
      .locator("section#reel [role='tab']")
      .filter({ hasText: "Intro" });
    const sceneTab = page
      .locator("section#reel [role='tab']")
      .filter({ hasText: "Scene" });
    const featuredTab = page
      .locator("section#reel [role='tab']")
      .filter({ hasText: "Featured" });

    await introTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(sceneTab).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(featuredTab).toHaveAttribute("aria-selected", "true");
    // ArrowRight 순환 → Intro
    await page.keyboard.press("ArrowRight");
    await expect(introTab).toHaveAttribute("aria-selected", "true");
    // End → 마지막 탭
    await page.keyboard.press("End");
    await expect(featuredTab).toHaveAttribute("aria-selected", "true");
    // Home → 첫 탭
    await page.keyboard.press("Home");
    await expect(introTab).toHaveAttribute("aria-selected", "true");
  });

  // B3 empty videoUrl skeleton — 모든 episode가 빈 URL이므로 skeleton 가시
  test("B3: empty videoUrl renders skeleton overlay + <video> markup reserved (REQ-ACT-O-001/O-002)", async ({
    page,
  }) => {
    await page.goto("/actor");
    const reel = page.locator("section#reel");
    // <video> 마크업은 항상 예약되어야 한다 (REQ-ACT-O-001)
    await expect(reel.locator("video")).toHaveCount(1);
    // skeleton overlay 표시
    await expect(reel.locator("[data-skeleton='true']")).toBeVisible();
    // skeleton 카피 가시 — "영상 준비 중"
    await expect(reel.getByText("영상 준비 중")).toBeVisible();
  });

  // B5 no third-party iframe (REQ-ACT-N-001)
  test("B5: Reel section contains no <iframe>", async ({ page }) => {
    await page.goto("/actor");
    const iframes = await page.locator("section#reel iframe").count();
    expect(iframes).toBe(0);
  });

  // B6 sessionStorage: 선택 episode 저장 + reload 후 복원, localStorage 미사용
  test("B6: episode selection persists in sessionStorage; localStorage stays empty", async ({
    page,
  }) => {
    await page.goto("/actor");

    // Scene 탭 활성화
    const sceneTab = page
      .locator("section#reel [role='tab']")
      .filter({ hasText: "Scene" });
    await sceneTab.click();

    // scene-3 episode 클릭 (Scene 카테고리의 3번째)
    const episode3 = page
      .locator("section#reel [data-episode-id='scene-3']")
      .first();
    await episode3.click();

    // sessionStorage 저장 확인
    const storedScene = await page.evaluate(() =>
      window.sessionStorage.getItem("actor.reel.lastEpisode.scene"),
    );
    expect(storedScene).toBe("scene-3");

    // localStorage는 사용 금지 — 전체 페이지에서 0건 (REQ-ACT-N-002)
    const localLen = await page.evaluate(() => window.localStorage.length);
    expect(localLen).toBe(0);

    // 페이지 reload 후 Scene 탭 다시 활성화 → scene-3가 selected
    await page.reload();
    await sceneTab.click();
    await expect(
      page.locator("section#reel [data-episode-id='scene-3']").first(),
    ).toHaveAttribute("aria-selected", "true");
  });

  // B7 reduced-data preload: matchMedia를 init script에서 패치
  test("B7: prefers-reduced-data sets <video preload='none'> (REQ-ACT-E-007)", async ({
    page,
    context,
  }) => {
    // beforeEach가 아닌 per-test로 matchMedia를 override.
    await context.addInitScript(() => {
      const origMM = window.matchMedia.bind(window);
      window.matchMedia = (q: string) => {
        if (q.includes("prefers-reduced-data")) {
          return {
            matches: true,
            media: q,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          } as unknown as MediaQueryList;
        }
        return origMM(q);
      };
    });
    await page.goto("/actor");
    const reelVideo = page.locator("section#reel video").first();
    await expect(reelVideo).toHaveCount(1);
    const preload = await reelVideo.evaluate(
      (el) => (el as HTMLVideoElement).getAttribute("preload"),
    );
    expect(preload).toBe("none");
    // autoplay는 비활성
    const autoplay = await reelVideo.evaluate(
      (el) => (el as HTMLVideoElement).autoplay,
    );
    expect(autoplay).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────────
// Phase 4: Roles (RoleTimeline + Character Cards with 3D flip)
// SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001/U-005/U-006/U-011,
// REQ-ACT-E-004/E-005, REQ-ACT-S-001/S-002/S-003,
// REQ-ACT-O-003/O-005, REQ-ACT-N-002/N-008
// ────────────────────────────────────────────────────────────────────
test.describe("Phase 4 roles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/actor");
  });

  // C5: 카드 정확히 5장, flippable 4장 (placeholder 1장 제외).
  // Phase 6 amendment (2026-05-22): 작품은 6편 그대로 유지되지만 character card는
  // 5장으로 축소 — gukhyeon-2025 (그래도 사랑이었다) 카드 본인 결정으로 제거.
  // REQ-ACT-U-006 6작품 lock은 TIMELINE/FILMOGRAPHY에서 그대로 준수.
  test("C5: section#roles renders exactly 5 character cards (REQ-ACT-U-006 작품 6편, 카드 5장)", async ({
    page,
  }) => {
    const cards = page.locator(
      'section#roles [data-character-card="true"]',
    );
    await expect(cards).toHaveCount(5);
    const flippable = page.locator(
      'section#roles [data-character-card="true"][data-card-flippable="true"]',
    );
    await expect(flippable).toHaveCount(4);
  });

  // C2: 모바일 tap → data-flipped="true" (REQ-ACT-E-004)
  test("C2: mobile tap on flippable card sets data-flipped='true' (REQ-ACT-E-004)", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto("/actor");
    const card = page
      .locator(
        'section#roles [data-character-card="true"][data-card-flippable="true"]',
      )
      .first();
    await card.click();
    await expect(card).toHaveAttribute("data-flipped", "true");
    await context.close();
  });

  // C3: placeholder 카드는 flip 비활성 (REQ-ACT-E-005)
  test("C3: placeholder card is not interactive (REQ-ACT-E-005)", async ({
    page,
  }) => {
    const placeholder = page.locator(
      'section#roles [data-character-card="true"][data-card-kind="placeholder"]',
    );
    await expect(placeholder).toHaveCount(1);
    await expect(placeholder).toHaveAttribute("data-card-flippable", "false");
  });

  // C4: 키보드 Enter로 flip 토글 (REQ-ACT-S-003)
  test("C4: keyboard Enter toggles flip on flippable card (REQ-ACT-S-003)", async ({
    page,
  }) => {
    const card = page
      .locator(
        'section#roles [data-character-card="true"][data-card-flippable="true"]',
      )
      .first();
    await card.focus();
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-flipped", "true");
    await page.keyboard.press("Enter");
    await expect(card).toHaveAttribute("data-flipped", "false");
  });

  // C6: 모바일 첫 세션 chevron 표시 → 첫 탭 → 모든 chevron 사라짐 + sessionStorage 저장 (REQ-ACT-O-005)
  test("C6: mobile first-session chevron disappears after first tap (REQ-ACT-O-005)", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto("/actor");
    const chevronsBefore = page.locator(
      'section#roles [data-chevron-hint="visible"]',
    );
    await expect(chevronsBefore.first()).toBeVisible();
    const cardCount = await chevronsBefore.count();
    expect(cardCount).toBe(4); // 4 flippable cards (Phase 6 amend: 국현 카드 제거)

    const firstCard = page
      .locator(
        'section#roles [data-character-card="true"][data-card-flippable="true"]',
      )
      .first();
    await firstCard.click();

    await expect(
      page.locator('section#roles [data-chevron-hint="visible"]'),
    ).toHaveCount(0);

    const stored = await page.evaluate(() =>
      window.sessionStorage.getItem("actor.roles.cardTapped"),
    );
    expect(stored).toBe("true");

    const localLen = await page.evaluate(() => window.localStorage.length);
    expect(localLen).toBe(0);

    await context.close();
  });

  // E1: prefers-reduced-motion → data-reduced-motion="true" (REQ-ACT-S-001)
  test("E1: prefers-reduced-motion disables 3D transform (REQ-ACT-S-001)", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/actor");
    const card = page
      .locator(
        'section#roles [data-character-card="true"][data-card-flippable="true"]',
      )
      .first();
    const reducedAttr = await card.getAttribute("data-reduced-motion");
    expect(reducedAttr).toBe("true");
    await context.close();
  });

  // G1: 모바일 viewport 320px에서 카드 grid 1-col (가로 스크롤 없음) (REQ-ACT-S-002)
  test("G1: 320px viewport renders cards in single column (REQ-ACT-S-002)", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 720 },
    });
    const page = await context.newPage();
    await page.goto("/actor");
    const docWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(docWidth).toBeLessThanOrEqual(320);
    await context.close();
  });

  // T-023 RoleTimeline 6 entries (REQ-ACT-U-006)
  test("RoleTimeline renders 6 entries in year-desc order (REQ-ACT-U-006)", async ({
    page,
  }) => {
    const timelineEntries = page.locator(
      "section#roles [data-role-timeline-entry]",
    );
    await expect(timelineEntries).toHaveCount(6);
    const firstYear = await timelineEntries.first().getAttribute("data-year");
    expect(firstYear).toBe("2026");
  });

  // T-024 Roles 섹션은 h2를 가지고, h1 단독은 그대로 유지된다
  test("Roles section has h2 and h1 count remains 1", async ({ page }) => {
    await expect(page.locator("section#roles")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.locator("section#roles h2").first(),
    ).toBeVisible();
  });

  // T-025 Roles 섹션 emoji 0건 (REQ-ACT-N-008)
  test("Roles section uses no emoji glyphs (REQ-ACT-N-008)", async ({
    page,
  }) => {
    const roles = page.locator("section#roles");
    const text = (await roles.textContent()) ?? "";
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    expect(text).not.toMatch(/[✀-➿]/);
    expect(text).not.toMatch(/[☀-⛿]/);
  });
});

// ────────────────────────────────────────────────────────────────────
// Phase 5: Final assembly — Contact 신규 컴포넌트 + 6 sections 완성 + 종합
// 회귀 (페르소나 substring 0건 / emoji 0건 / 키보드 traversal / 6작품 정확성
// / footer 카피라이트).
// SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001/U-002/U-006/U-008/U-010/U-011,
// REQ-ACT-N-004/N-005/N-008, REQ-ACT-S-003
//
// 기존 Phase 1~4 케이스는 한 글자도 수정하지 않는다. 본 describe는 page.tsx의
// Contact 교체와 6섹션 최종 조립에 한정된 회귀 보호이다.
// ────────────────────────────────────────────────────────────────────
test.describe("Phase 5 final assembly", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/actor");
  });

  // A2: 6 sections 모두 DOM에 존재 (REQ-ACT-U-001).
  test("A2: 6 sections present (REQ-ACT-U-001)", async ({ page }) => {
    // Hero는 <section aria-label="Hero">로, 나머지 5섹션은 id로 식별된다.
    // Hero는 별도 selector로 단독 검증.
    await expect(page.locator('section[aria-label="Hero"]')).toHaveCount(1);
    await expect(page.locator("section#profile")).toHaveCount(1);
    await expect(page.locator("section#reel")).toHaveCount(1);
    await expect(page.locator("section#roles")).toHaveCount(1);
    await expect(page.locator("section#filmography")).toHaveCount(1);
    await expect(page.locator("section#contact")).toHaveCount(1);
    // Hero가 단독으로 h1을 보유 (LD1).
    await expect(page.locator("h1")).toHaveCount(1);
  });

  // Contact 컴포넌트 기본 마크업 — 매거진 헤드라인 + 두 링크.
  test("Contact section renders mailto and instagram links", async ({
    page,
  }) => {
    const contact = page.locator("section#contact");
    await expect(contact).toBeVisible();
    await expect(
      contact.locator('a[href="mailto:terryjhw@gmail.com"]'),
    ).toHaveCount(1);
    await expect(
      contact.locator('a[href*="instagram.com/oceanmeetrain"]'),
    ).toHaveCount(1);

    // h2 headline 'C A S T I N Q U I R Y' (공백 무시 + 대소문자 무시).
    const h2text = await contact.locator("h2").first().textContent();
    const normalized = (h2text ?? "").replace(/\s+/g, "").toUpperCase();
    expect(normalized).toContain("CASTINQUIRY");
  });

  // Contact h2의 id가 section의 aria-labelledby와 매칭되는지 (a11y).
  test("Contact section has accessible heading association", async ({
    page,
  }) => {
    const contact = page.locator("section#contact");
    const ariaLabelledBy = await contact.getAttribute("aria-labelledby");
    expect(ariaLabelledBy).toBe("contact-heading");
    await expect(page.locator("#contact-heading")).toHaveCount(1);
  });

  // H1 + H2: 정확히 6작품 노출 + 금지 작품 0건 (REQ-ACT-U-006, REQ-ACT-N-005).
  test("H1/H2: filmography lists exactly 6 works, no excluded titles (REQ-ACT-U-006, REQ-ACT-N-005)", async ({
    page,
  }) => {
    // Filmography 컴포넌트의 작품 entry selector는 data-filmo-entry이다.
    await expect(
      page.locator("section#filmography [data-filmo-entry]"),
    ).toHaveCount(6);

    // §6 D5에 명시된 6 작품 제목이 모두 노출되는지 확인.
    const filmography = page.locator("section#filmography");
    const expectedTitles = [
      "너만 있으면",
      "당신이 죽였다",
      "그래도 사랑이었다",
      "요즘것들",
      "어느날 엄마가 봉투를 썼다",
      "눈",
    ];
    for (const t of expectedTitles) {
      await expect(filmography.getByText(t).first()).toBeVisible();
    }
    expect(expectedTitles.length).toBe(6);

    // 금지 작품(이전 데이터에 있었던 작품)은 본문 어디에도 0건.
    // [data-actor-body] 내부 텍스트로 검증 (nav/footer 포함하지만 이 작품들은
    // 어디에도 등장하면 안 됨).
    const body = page.locator("[data-actor-body]");
    const bodyText = (await body.innerText()) ?? "";
    for (const banned of [
      "사랑하거나 말거나",
      "단절",
      "삶 ",
      "오르골",
      "오르골들",
      "매장직원",
    ]) {
      expect(bodyText).not.toContain(banned);
    }
  });

  // H3: 본문(section 영역) prohibited substring 0건 (REQ-ACT-N-004).
  // Phase 2의 동등 케이스는 section 직속 텍스트만 검증했고, Phase 5에서는
  // Contact 신규 컴포넌트가 본문에 합쳐졌으므로 6 section 전부를 재검증한다.
  test("H3: body sections contain zero prohibited substrings (REQ-ACT-N-004)", async ({
    page,
  }) => {
    // [data-actor-body] 직속 section 텍스트를 합친다. SiteNav 영역은 제외 —
    // SiteNav는 페르소나 라우팅을 위해 /dev 링크를 가질 수 있는 예외이다
    // (REQ-ACT-N-004 마지막 단락 + REQ-ACT-U-008).
    const sectionTexts = await page
      .locator("[data-actor-body] > section")
      .allTextContents();
    // Hero의 aria-label로 식별되는 section은 직속 자식이 아닐 수 있어
    // SiteNav를 제외한 모든 section을 백업으로 추가 매칭한다.
    const allSectionTexts = await page.locator("section").allTextContents();
    const joined = [...sectionTexts, ...allSectionTexts].join("\n");
    const lower = joined.toLowerCase();

    const substrings = [
      "iit",
      "illinois institute of technology",
      "computer science",
      "hanwha",
      "한화시스템",
      "한화 시스템",
      "ai technical engineer",
      "ai engineer",
      "data engineer",
      "hyunwoo jee",
      "지현우",
      "developer",
      "engineer",
      "엔지니어",
    ];
    for (const s of substrings) {
      expect(lower).not.toContain(s);
    }

    // 'Terry'는 word boundary로 검증 — 'terryjhw@gmail.com' 이메일은 허용.
    // case-insensitive word boundary 매칭은 본문에 단독 'Terry'가 노출되면
    // 위반이지만 이메일 사용자명에 포함된 'terryjhw'는 word 일부라 통과한다.
    expect(joined).not.toMatch(/\bTerry\b/i);
  });

  // H4: 본문 emoji glyph 0건 (REQ-ACT-N-008).
  // Node V8은 \p{Extended_Pictographic} 유니코드 속성 클래스를 지원한다.
  test("H4: body contains zero emoji glyphs (REQ-ACT-N-008)", async ({
    page,
  }) => {
    const sectionTexts = await page
      .locator("[data-actor-body] section")
      .allTextContents();
    const joined = sectionTexts.join("\n");
    const emojiRegex = /\p{Extended_Pictographic}/u;
    expect(emojiRegex.test(joined)).toBe(false);
  });

  // H5: 본문 <main>/section 내 /dev href 0건 (REQ-ACT-U-008).
  // SiteNav(공통 header)는 페르소나 라우팅을 위해 /dev 링크를 가질 수 있다 —
  // REQ-ACT-N-004 마지막 단락의 예외. 본문 section만 검사한다.
  test("H5: body sections contain zero /dev hrefs (REQ-ACT-U-008)", async ({
    page,
  }) => {
    const hrefs = await page
      .locator("[data-actor-body] > section a")
      .evaluateAll((anchors) =>
        anchors.map(
          (a) => (a as HTMLAnchorElement).getAttribute("href") ?? "",
        ),
      );
    const devLinks = hrefs.filter((h) => h.startsWith("/dev"));
    expect(devLinks.length).toBe(0);
  });

  // K3: footer 카피라이트 © 2026 서해우 (REQ-ACT-U-010).
  test("K3: footer shows 2026 서해우 (REQ-ACT-U-010)", async ({ page }) => {
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
    const text = (await footer.innerText()) ?? "";
    expect(text).toContain("2026");
    expect(text).toContain("서해우");
  });

  // E3 sample: 키보드 Tab traversal이 Contact 이메일 링크에 도달 가능
  // (REQ-ACT-S-003). 페이지 첫 focusable에서 시작해 Tab을 충분히 눌러
  // mailto:terryjhw@gmail.com anchor가 활성 포커스가 되는지 확인한다.
  test("E3: tab order reaches Contact mailto link (REQ-ACT-S-003)", async ({
    page,
  }) => {
    // body로 포커스 시작점을 명시화.
    await page.evaluate(() => document.body.focus());

    let reached = false;
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLAnchorElement | null;
        if (!el) return { tag: "", href: "" };
        return {
          tag: el.tagName,
          href: (el as HTMLAnchorElement).href ?? "",
        };
      });
      if (
        focused.tag === "A" &&
        focused.href.startsWith("mailto:terryjhw@gmail.com")
      ) {
        reached = true;
        break;
      }
    }
    expect(reached).toBe(true);
  });

  // Contact emoji 0건 — Phase 2의 profile/filmography emoji 테스트와 동일 패턴.
  test("Contact section uses no emoji glyphs (REQ-ACT-N-008)", async ({
    page,
  }) => {
    const contact = page.locator("section#contact");
    const text = (await contact.textContent()) ?? "";
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    expect(text).not.toMatch(/[✀-➿]/);
    expect(text).not.toMatch(/[☀-⛿]/);
  });
});
