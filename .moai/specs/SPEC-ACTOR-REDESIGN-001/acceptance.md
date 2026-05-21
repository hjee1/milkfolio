# Acceptance — SPEC-ACTOR-REDESIGN-001

Given/When/Then 시나리오로 "완료" 정의. Playwright + Lighthouse + 수동 검증의 조합.

---

## A. 기본 렌더 & 정체성

### A1. 페이지 진입 시 새 톤이 명확히 보인다

**Given** 사용자가 데스크톱 브라우저로 `/actor`에 진입했고
**When** 페이지가 로드 완료되었을 때
**Then**
- Hero 섹션이 `#0a0a0a` 배경 + `서해우 / Seo Haeu — Actor since 2023` 카피를 표시한다
- Profile 섹션부터 본문 배경이 `#f8f5f0` off-white로 전환된다
- Hero→Profile 사이에 수직 fade bridge가 시각적으로 인지된다 (gradient banding 없음)

**검증**: Playwright `expect(page.locator('section').first()).toHaveCSS('background-color', /rgb\(10, 10, 10\)/)` + Profile 섹션 배경색 검증

### A2. 6개 섹션이 모두 렌더된다

**Given** 사용자가 `/actor`에 진입했고
**When** 페이지가 로드 완료되었을 때
**Then** 다음 6개 섹션이 DOM에 존재하며 viewport에 스크롤 가능하다:
1. Hero (`#top` 또는 첫 `<section>`)
2. Profile
3. Reel
4. Roles
5. Filmography
6. Contact

**검증**: Playwright `expect(page.locator('section')).toHaveCount(6)` (또는 명시적 ID로 각각 확인)

### A3. Profile 섹션이 매거진 헤드라인을 표시한다

**Given** 사용자가 Profile 섹션에 도달했을 때
**When** Profile 헤드라인을 스캔하면
**Then**
- Cormorant Garamond 큰 H1 `S E O   H A E U`가 표시된다
- 한국어 부제 `서해우`가 표시된다
- profile 테이블 5~6개 행(생년 / 신체 / 언어 / 특기 / 이메일)이 표시된다

**검증**: Playwright `expect(page.locator('h1')).toContainText('SEO HAEU')` (자간 제거 normalize) + `expect(page).toContainText('1994.04.18')`

---

## B. Reel 인터랙션

### B1. Reel 카테고리 탭이 키보드와 마우스로 활성화된다

**Given** 사용자가 Reel 섹션까지 스크롤했고
**When** 사용자가 `Scene` 탭을 클릭하면
**Then**
- 좌측 player가 Scene 카테고리의 첫 episode로 갱신된다
- 우측 episode list가 Scene 카테고리의 episode들로 갱신된다
- 풀-페이지 네비게이션이 발생하지 않는다 (URL hash 변경 허용)
- 활성 탭에 키보드 포커스가 유지된다

**검증**: Playwright `await page.locator('[role="tab"]', { hasText: 'Scene' }).click()` + episode list assertion

### B2. Reel 탭 키보드 좌우 화살표 패턴

**Given** 사용자가 키보드만 사용하고
**When** Reel 탭 strip에 focus한 뒤 `ArrowRight`를 누르면
**Then**
- 활성 탭이 다음 카테고리로 이동한다 (Intro → Scene → Featured → Intro circular)
- 활성 탭에 시각적 포커스 링이 명확히 표시된다
- 비활성 탭은 `aria-selected="false"`로 표기된다

**검증**: Playwright `page.keyboard.press('ArrowRight')` + `aria-selected` assertion

### B3. 빈 `videoUrl`의 episode가 elegant skeleton으로 표시된다

**Given** Reel 카테고리의 모든 episode `videoUrl`이 빈 상태에서
**When** 사용자가 어떤 episode를 클릭하면
**Then**
- player에 "영상 준비 중" skeleton(미세 grain)이 표시된다
- 페이지가 깨지지 않고 오류를 throw하지 않는다
- 다른 카테고리 탭도 정상 작동한다

**검증**: Playwright `expect(page.locator('[data-reel-skeleton]')).toBeVisible()` + console error 0건

### B4. 모바일 Reel 세로 stack

**Given** 뷰포트 너비가 768px 미만인 모바일에서
**When** Reel 섹션을 렌더하면
**Then**
- player가 episode list 위에 표시된다 (세로 stack)
- 가로 스크롤이 발생하지 않는다
- 탭 strip이 가로 스크롤 또는 wrap으로 표시된다

**검증**: Playwright `devices['iPhone 13']` + DOM order assertion

### B5. 외부 영상 호스팅 iframe 부재

**Given** Reel 섹션이 렌더된 상태에서
**When** DOM의 모든 `<iframe>` / `<embed>`를 스캔하면
**Then**
- `youtube.com`, `vimeo.com`, `player.vimeo.com` 등 third-party 영상 임베드 0건
- 영상은 자체 호스팅 `<video>` 요소만 사용한다

**검증**: Playwright `expect(page.locator('iframe[src*="youtube"], iframe[src*="vimeo"]')).toHaveCount(0)`

---

## C. Character Card 인터랙션

### C1. 데스크톱 hover 시 카드 flip

**Given** 사용자가 데스크톱에서 Roles 섹션에 도달했고
**When** 사용자가 character card(예: 점원/당신이 죽였다)에 마우스 호버하면
**Then**
- 카드가 3D flip transform으로 회전한다
- back face(스틸 mini-grid + 카드 schema의 note + hashtags)가 노출된다
- 다른 카드는 영향받지 않는다

**검증**: Playwright `await page.locator('[data-character-card="jeomwon"]').hover()` + back face DOM visibility assertion

### C2. 모바일 tap 시 카드 flip

**Given** 모바일에서 Roles 섹션에 도달한 사용자가
**When** character card를 탭하면
**Then**
- 카드가 flip(또는 reduced-motion 시 opacity fade)으로 back face를 노출한다
- 두 번째 tap 시 다시 front face로 돌아간다

**검증**: Playwright `devices['iPhone 13']` + `await card.tap()` + back face assertion + 두 번째 tap

### C3. Placeholder 카드는 flip 대신 정적 카피 유지

**Given** 너만 있으면(준혁) placeholder character card에 사용자가
**When** hover 또는 tap하면
**Then**
- 카드가 flip되지 않는다 (또는 back에 "촬영 자료 입수 후 채워집니다" 한 줄만)
- front face의 typographic 카피(`STILL COMING · 2026` 등)는 사라지지 않는다

**검증**: Playwright card 식별 + flip transform 0 assertion

### C4. 키보드 only 카드 활성화

**Given** 키보드만 사용하는 사용자가
**When** `Tab`으로 character card 버튼에 도달한 뒤 `Enter` 또는 `Space`를 누르면
**Then**
- 카드가 마우스 호버와 동일하게 flip된다
- 포커스 링이 명확히 표시된다

**검증**: Playwright `page.keyboard.press('Tab')` 반복 + `Enter` 후 flip assertion

### C5. 6장 모두 렌더된다 (5 real + 1 placeholder)

**Given** Roles 섹션이 렌더된 상태에서
**When** character card 수를 세면
**Then** 정확히 6장이 표시된다 (점원 / 국현 / 민혁 / 대현 / 집주인 / 준혁-placeholder)

**검증**: Playwright `expect(page.locator('[data-character-card]')).toHaveCount(6)`

---

## D. Hero 영상 placeholder ↔ 활성 contract

### D1. `HERO.reelUrl`이 빈 상태에서 정적 portrait fallback

**Given** `data.ts`의 `HERO.reelUrl`이 빈 문자열이고
**When** 사용자가 `/actor`에 진입하면
**Then**
- Hero에 정적 portrait(`PROFILE.hero` 또는 `HERO.posterImage`)가 표시된다
- film grain overlay가 적용된다
- 미세 ken-burns 애니메이션이 동작한다 (reduced-motion 시 정지)
- `<video>` 요소가 DOM에 예약되어 있다 (markup 변경 없이 URL 주입 가능 contract)

**검증**: Playwright `expect(page.locator('video')).toBeAttached()` + poster img visibility + ken-burns CSS transform animation 존재 확인

### D2. `HERO.reelUrl` 채워진 상태에서 video 활성

**Given** `data.ts`의 `HERO.reelUrl`에 URL을 페이스트한 상태에서
**When** 페이지가 로드되면
**Then**
- `<video>` 요소가 autoplay/muted/playsinline/loop로 활성화된다
- 정적 portrait는 video poster로 강등되거나 fade out된다
- 마크업/컴포넌트 코드 변경 없이 데이터 변경만으로 활성화된다

**검증**: 별도 데이터 fixture로 Playwright test variant 작성 (옵션, SPEC 시점 URL 빈 값이므로 수동 검증으로 대체 가능)

### D3. Hero 영역 카피가 영상 유무와 무관하게 표시된다

**Given** `HERO.reelUrl` 유무와 상관없이
**When** 사용자가 Hero 영역을 스캔하면
**Then**
- 좌측 하단 `서해우 / Seo Haeu`, `Actor since 2023` 카피가 항상 표시된다
- 출연작 라인업 힌트 한 줄이 표시된다
- 우측 하단 scroll cue가 표시된다

**검증**: Playwright `expect(page.locator('text=서해우')).toBeVisible()` + `expect(page).toContainText('Actor since 2023')`

---

## E. 접근성

### E1. `prefers-reduced-motion` 존중

**Given** 사용자가 OS 레벨에서 `prefers-reduced-motion: reduce`를 활성화했고
**When** 사용자가 `/actor`에 진입했을 때
**Then**
- Hero `<video>` 자동재생이 비활성화되거나 정지된다
- ken-burns transform이 정지된다
- character card flip transform이 opacity fade로 대체된다 (3D rotate 0)
- Reel 자동 전환이 없으므로 기본 동작 유지

**검증**: Playwright `await page.emulateMedia({ reducedMotion: 'reduce' })` 후 video paused / transform 측정

### E2. `prefers-reduced-data` 존중

**Given** 사용자가 OS 또는 브라우저 레벨에서 data-saver 모드를 활성화했고
**When** 사용자가 `/actor`에 진입했을 때
**Then**
- Hero `<video>` 자동재생이 비활성화된다
- 정적 poster image만 표시된다
- 페이지 다른 영역은 정상 작동한다

**검증**: Playwright `await context.addInitScript(() => { Object.defineProperty(navigator, 'connection', { get: () => ({ saveData: true }) }) })` + video.autoplay 검증

### E3. 키보드 only 완전 탐색

**Given** 사용자가 마우스를 사용하지 않고 키보드만 사용할 때
**When** 사용자가 `Tab`을 반복적으로 누르면
**Then**
- 페이지의 모든 인터랙티브 요소(nav 링크, Reel 탭, Reel episode 버튼, character card, contact 링크)에 순서대로 도달 가능하다
- 각 요소에서 포커스 링이 dark hero와 off-white body 양쪽에서 명확히 표시된다
- 헤딩 구조(h1 → h2 → h3) 위계가 합리적이다

**검증**: Playwright + 수동 검증 (Tab으로 모든 요소 도달 확인)

### E4. WCAG 2.1 AA 준수

**Given** 페이지가 완전히 렌더된 상태에서
**When** axe-core 또는 Lighthouse Accessibility 감사를 실행하면
**Then**
- Accessibility 점수 >= 95
- 컬러 콘트라스트 위반 0건 (off-white 위 ink black, 액센트 hairline 검증)
- aria-label / alt 누락 0건 (모든 character card 이미지, hero portrait)
- 헤딩 위계(h1 → h2 → h3) 위반 0건
- Reel `role="tablist"` / `role="tab"` / `role="tabpanel"` 패턴 적합

**검증**: Playwright + `@axe-core/playwright` 또는 Lighthouse CI

### E5. 의미있는 alt 텍스트

**Given** 페이지의 모든 `<img>` 요소에 대해
**When** alt 속성을 스캔하면
**Then**
- alt가 빈 문자열이 아닌 의미있는 한국어 설명을 가진다 (예: `당신이 죽였다 점원 스틸 1`)
- 장식 목적이 명확한 이미지는 `alt=""` + `aria-hidden="true"`로 표기된다
- emoji 글리프 사용은 0건이다

**검증**: Playwright `for await (const img of page.locator('img').all()) { ... }` + alt 길이 / 의미 검증

---

## F. 성능

### F1. Lighthouse 모바일 Performance >= 80

**Given** 사이트가 Vercel에 배포된 상태에서
**When** Lighthouse 모바일 시뮬레이션 감사를 실행하면
**Then**
- Performance >= 80
- LCP < 2.5s
- CLS < 0.1
- TBT 합리적 범위

**검증**: Lighthouse CLI 또는 Vercel Speed Insights

### F2. 초기 JS 번들 크기

**Given** 프로덕션 빌드가 완료된 상태에서
**When** Next.js 빌드 출력의 `/actor` 라우트 초기 JS를 측정하면
**Then** Client leaf 4개(HeroReel / ReelPlayer / CharacterCard) 합산 번들이 합리적 범위 내에 있다

**검증**: `pnpm build` 출력 + bundle analyzer (정량 임계는 측정 후 결정, `/dev` 250KB 예산 대비 작아야 함)

### F3. LCP element는 Hero poster 또는 portrait

**Given** 데스크톱 Chrome에서
**When** Lighthouse가 LCP element를 식별하면
**Then** LCP element는 Hero의 portrait `<img>` 또는 video poster이며, video 자체가 아니다 (video는 preload=none 우선)

**검증**: Lighthouse Performance trace의 LCP 후보 검사

---

## G. 반응형

### G1. 모바일 320px 그레이스풀 디그레이드

**Given** 뷰포트 너비가 320px인 모바일에서
**When** `/actor`에 진입했을 때
**Then**
- 가로 스크롤이 발생하지 않는다
- 모든 텍스트가 읽을 수 있는 크기로 표시된다
- character card grid가 1-col로 stack된다
- Reel player + episode list가 세로 stack된다
- Profile portrait가 위, profile 테이블이 아래로 stack된다

**검증**: Playwright `devices['iPhone SE']` 또는 `viewport: { width: 320, height: 568 }`

### G2. 태블릿·데스크톱 레이아웃

**Given** 뷰포트 너비가 768px / 1024px / 1920px일 때
**When** `/actor`에 진입했을 때
**Then**
- 768px: character card 2-col, Reel 세로 stack 또는 좁은 좌우, Profile 2-col
- 1024px: character card 3-col, Reel 좌우 분할(player 65% / list 35%), Profile 12-col grid
- 1920px+: 적절한 max-width 컨테이너로 콘텐츠 폭 제어, 매거진 호흡 유지

**검증**: Playwright + 스크린샷 비교 또는 수동 검증

---

## H. 콘텐츠 정책 준수

### H1. 작품 set이 정확히 §6 D5 6개와 일치

**Given** 페이지의 Filmography + RoleTimeline + CharacterCard 모두에서
**When** 작품명을 추출하면
**Then** 다음 6개만 등장한다:
- 너만 있으면 (2026, 준혁)
- 당신이 죽였다 (2025, 점원, Netflix)
- 그래도 사랑이었다 (2025, 국현)
- 요즘것들 (2024, 민혁, 뮤지컬)
- 어느날 엄마가 봉투를 썼다 (2023, 대현)
- 눈 (2023, 집주인)

**검증**: Playwright text content 추출 + set 비교

### H2. 금지 작품 미노출

**Given** 페이지의 어떤 텍스트에도
**When** 금지 작품명을 검색하면
**Then** 다음 문자열이 0건 등장한다:
- `사랑하거나 말거나`
- `단절`
- `삶` (단어 자체가 일반 명사이므로 작품 컨텍스트에서만 검증)
- `오르골`
- `오르골들`
- `매장직원` (정정 전 표기)

**검증**: Playwright `await page.content()` + regex 검색

### H3. AI Technical Engineer 정체성 cross-link 부재

**Given** 페이지가 렌더된 상태에서
**When** 모든 `<a>`, `<Link>` 태그를 스캔하면
**Then**
- `/dev` 경로로의 링크가 존재하지 않는다
- "AI Technical Engineer", "Data Engineer", "Hyunwoo Jee" 단어가 본문에 등장하지 않는다 (`Seo Haeu` / `서해우`만 허용)
- LinkedIn URL은 actor 컨텍스트에서 노출하지 않는다 (캐스팅 inquiry는 메일/인스타로 라우팅)

**검증**: Playwright `expect(page.locator('a[href*="/dev"]')).toHaveCount(0)` + 본문 text 검색

### H4. emoji 글리프 부재

**Given** 페이지의 모든 텍스트 노드에 대해
**When** Unicode emoji 글리프를 스캔하면
**Then** ✉, 📷, 그 외 emoji 글리프가 0건이다 (typography 또는 SVG로 대체)

**검증**: Playwright text content + emoji regex (`/[\u{1F300}-\u{1FAFF}]|[✀-➿]/u`)

---

## I. Hero 메타·전환

### I1. Hero→Profile 톤 전환

**Given** 사용자가 Hero에서 Profile로 스크롤하면
**When** 전환 구간(80px 정도)을 관찰하면
**Then**
- 배경이 `#0a0a0a`에서 `#f8f5f0`로 부드럽게 fade된다
- gradient banding이 시각적으로 인지되지 않는다
- 텍스트 콘트라스트가 전환 구간에서도 합리적이다

**검증**: 수동 검증 (스크린샷 + 시각 비교)

### I2. Hero 카피와 시각 자산의 정합성

**Given** Hero가 렌더된 상태에서
**When** 카피 라인업 힌트와 실제 character card / Filmography를 대조하면
**Then** 라인업 힌트에 언급된 작품들이 본문 섹션에 실제로 존재한다 (예: `Netflix · 당신이 죽였다 (2025)` 언급 → Filmography 드라마 블록에 동일 항목)

**검증**: Playwright text 추출 + 일관성 검증

---

## J. 회귀 (다른 페르소나 영향)

### J1. /dev, /designer, /agent 영향 없음

**Given** SPEC-ACTOR-REDESIGN-001 변경 후
**When** 사용자가 `/dev`, `/designer`, `/agent`를 방문하면
**Then** 각 페이지가 변경 전과 동일하게 작동한다 (스크린샷·인터랙션 회귀 없음)

**검증**: Playwright `e2e/dev.spec.ts`, `designer.spec.ts`, `agent.spec.ts` 통과

### J2. 글로벌 폰트 / 공유 컴포넌트 영향 최소

**Given** 변경 후 `app/globals.css`와 `components/SiteNav`, `components/SiteFooter`가
**When** git diff로 확인되면
**Then**
- 글로벌 폰트 토큰 추가(Cormorant, Pretendard)만 허용된 변경
- 기존 `--font-serif-ko` (Noto Serif KR) 정의는 다른 페르소나에 영향 없도록 유지 또는 actor 범위 격리
- `SiteNav` / `SiteFooter`의 구조 변경 없음 (액센트 토큰 차등만 허용)

**검증**: PR diff 검토

---

## K. 빌드·배포 게이트

### K1. 모든 품질 게이트 통과

**Given** PR이 main에 머지되기 전
**When** CI 파이프라인이 실행되면
**Then**
- `pnpm typecheck` 통과 (strict, 에러 0)
- `pnpm lint` 통과 (warning 허용 범위 내)
- `pnpm e2e` 통과 (5개 spec 전체)
- Lighthouse CI(있다면) Performance >= 80

### K2. Vercel 미리보기 정상

**Given** PR이 생성된 상태에서
**When** Vercel preview deploy가 완료되면
**Then**
- preview URL이 정상 응답 (HTTP 200)
- /actor 경로가 시각적으로 의도대로 렌더
- 다른 라우트(/, /dev, /designer, /agent) 회귀 없음

---

## L. 수동 정성 검증 (KPI 게이트)

### L1. "이 배우와 회의를 잡고 싶다" 게이트

**Given** Vercel 미리보기 URL이 준비된 상태에서
**When** 사용자(Hyunwoo) 또는 한국 캐스팅 디렉터 referenced 인물이 직접 미리보기를 본 후
**Then** "이 배우와 회의를 잡고 싶다"에 준하는 정성적 만족도를 표명한다 (`.moai/project/product.md` KPI).

**검증**: 사용자 검수 round, 필요 시 카피·시각 디테일 polish 반복

### L2. 톤 일관성 검증

**Given** 페이지의 모든 카피를 한 번에 읽었을 때
**When** 톤 평가를 하면
**Then**
- VOGUE Korea 디지털 커버 호흡과 정렬된다 (절제 + editorial)
- 오만하지 않고, 캐스팅 inquiry CTA가 명확하다
- 한국어 표기가 자연스럽다 (영문 라벨 예외만 영문)
- 배우 정체성에 일관된다 (직업/엔지니어 정체성 노출 0)

**검증**: 사용자 검수

---

## M. 완료 체크리스트 (Definition of Done)

- [ ] 모든 A ~ K 시나리오 통과
- [ ] 사용자 정성 검증(L1) 통과
- [ ] PR이 main에 머지됨
- [ ] milkfolio.space/actor 프로덕션 반영 확인
- [ ] sync workflow 실행 → 관련 문서 갱신
- [ ] `HERO.reelUrl` / Reel `videoUrl`이 모두 빈 상태에서도 페이지가 정상 동작
- [ ] character card 카피 인터뷰 round 일정 합의(Phase 6, 별개 작업)
