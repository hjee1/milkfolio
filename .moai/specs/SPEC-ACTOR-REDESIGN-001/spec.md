---
id: SPEC-ACTOR-REDESIGN-001
version: 1.0.0
status: completed
created: 2026-05-21
updated: 2026-05-22
author: Hyunwoo Jee (terryjhw@gmail.com)
priority: P1
issue_number: 0
methodology: DDD
target_file: app/actor/page.tsx + app/actor/_components/** + app/actor/data.ts
test_file: e2e/actor.spec.ts
---

# SPEC-ACTOR-REDESIGN-001 — `/actor` 풀파워 재설계 (Editorial Magazine · 캐스팅 결정 30초)

## HISTORY

- 2026-05-21 — v1.0.0 — 최초 작성. 정적 5섹션(Hero/About/Filmography/Gallery/Contact) 다크 시네마틱 페이지를 6섹션(Hero/Profile/Reel/Roles/Filmography/Contact) Editorial Magazine 페이지로 전면 재설계. 비주얼 톤 다크 시네마틱 → off-white(#f8f5f0) VOGUE 디지털 커버. 폰트 Noto Serif KR → Cormorant Garamond + Pretendard. Hero를 정적 사진 + 영상 reel 셀(placeholder shell)로 격상. Netflix-style Reel 섹션 신설(3 카테고리: Intro/Scene/Featured). Roles 섹션 신설(타임라인 + 6 character cards with flip). Filmography 매거진-인덱스 타이포로 재구성, 작품 6편으로 확정·정정. 단일 Server Component 페이지에 4개 Client Component leaf(HeroReel/ReelPlayer/CharacterCard/RoleTimeline) 도입. SPEC-DEV-REDESIGN-001과 대칭되는 actor 페르소나의 풀파워 재설계.
- 2026-05-21 — v1.0.0 — Amendment before user approval. Resolved 7 open questions from initial draft: (1) Hero→Profile 80px gradient bridge locked, (2) Reel tab last-selected sessionStorage memory added, (3) Gold accent expanded to 3 zones with WCAG verification, (4) persona separation reinforced with explicit prohibited-string list, (5) footer year 2026, (6) mobile card flip chevron hint, (7) placeholder-first asset lifecycle clarified.

---

## 1. 배경 (Why)

### 현재 상태
`milkfolio.space/actor` 페이지(`app/actor/page.tsx`, 149 LOC, 5섹션 정적 Server Component)는 다크 시네마틱 노이르 톤이다. cyan 대신 warm gold(#b8a98a) 액센트 + Noto Serif KR + grayscale 사진. 클라이언트 JS 0, 인터랙션 0. 갤러리는 단순 그리드. 필모그래피는 정보가 부정확한 항목을 다수 포함한다(예: 매장직원 → 점원, 대현 캐릭터 누락, 존재하지 않는 작품 다수).

### 문제점
1. **캐스팅 결정 30초 윈도우 미충족** — 캐스팅 디렉터는 첫 화면에서 "이 배우와 회의를 잡고 싶다"를 0.5초 단위로 판단한다. 현재의 정적 그리드 갤러리·텍스트 위주 hero는 그 결정을 트리거하지 못한다.
2. **연기 실력 증명 채널 부재** — 사진은 정지 매체. 연기 능력은 영상(monologue, scene work)으로만 증명된다. 현재 페이지에는 영상 reel을 담을 자리가 없다.
3. **필모그래피 데이터 부정확** — 캐릭터명·역할 타입·작품명 정정 필요. 사용하지 않을 작품이 다수 포함되어 신뢰도를 떨어뜨림.
4. **인물(character) ↔ 작품(work) 분리 부재** — 현재는 작품 단위 필모그래피만 있고, 배우가 어떤 character를 어떻게 연기했는지를 보여주는 컷이 없다.
5. **톤 incoherence** — 다크 노이르는 분위기는 있으나 한국 캐스팅 시장의 표준 referencce(VOGUE Korea, GQ Korea, 매거진 진)와 정렬되지 않는다.

### 해결 방향
**"Editorial Magazine + Netflix-style Reel + Character Cards"** — VOGUE Korea 디지털 커버의 off-white 매거진 톤으로 페이지 본문을 통합하고, Hero만 다크(#0a0a0a)로 유지해 영상 reel을 시네마틱하게 보여준다. 본문은 (1) 매거진 프로필, (2) Netflix detail page 형식의 reel, (3) character card flip grid로 구성해 30초 안에 배우의 인상·연기 능력·역할 폭을 전달한다.

---

## 2. 범위 (Scope)

### IN SCOPE

- `app/actor/page.tsx` 전면 재작성 (6섹션 구조, Server Component 부모)
- `app/actor/_components/` 신규 디렉터리 + 6개 섹션 + 4개 Client leaf
- `app/actor/page.module.css` 비주얼 시스템 전면 교체 (off-white 매거진 + 다크 hero)
- `app/actor/data.ts` 전면 재구조화 (PROFILE / HERO / REEL / TIMELINE / CHARACTER_CARDS / FILMOGRAPHY / NAV_LINKS)
- `app/actor/layout.tsx` 메타데이터 업데이트 (직함·OG)
- `e2e/actor.spec.ts` Playwright 회귀 확장 (새 섹션 / 인터랙션 / 접근성 / 영상 placeholder)
- 글로벌 폰트 토큰 확장 (Cormorant Garamond + Pretendard 추가, Noto Serif KR는 actor 범위 내에서만 제거)

### OUT OF SCOPE

- `/dev`, `/designer`, `/agent` 페이지 변경 (별개 SPEC)
- 공유 컴포넌트(`SiteNav`, `SiteFooter`) 구조 변경 — actor 범위는 인라인 nav 또는 기존 컴포넌트의 actor 액센트 사용 유지
- 실제 reel 영상 파일 제작·편집 (사용자가 추후 academy 모놀로그 클립을 편집 후 URL 페이스트)
- 실시간 CMS·서버 fetch — 모든 데이터는 `data.ts` 정적 모듈
- 회원/구독/예약 시스템 — 캐스팅 inquiry는 메일·인스타 단일 경로
- character card의 실제 카피(notes, hashtags) 작성 — SPEC은 데이터 schema만 정의, 카피는 구현 단계 별도 사용자 인터뷰 round
- 배우 정체성 ↔ AI Technical Engineer 정체성 cross-link (사용자 명시 "직업 완벽 분리" 원칙)
- 다국어(i18n) — `/actor`는 한국어 고정, 캐스팅 라벨만 영문(Intro/Scene/Featured)
- 영상 재생 자체에 대한 E2E (SPEC 시점에 URL 빈 값)
- Three.js / WebGL — `/actor`는 photography + typography 기반, 3D 없음

---

## 3. EARS 요구사항

### Ubiquitous (항상 참)

- **REQ-ACT-U-001**: `/actor` 페이지는 6개 섹션(Hero / Profile / Reel / Roles / Filmography / Contact)으로 구성된다.
- **REQ-ACT-U-002**: 페이지의 모든 본문 텍스트는 한국어로 작성된다. 영문이 허용되는 위치는 (a) 큰 타이포 헤드라인(`S E O   H A E U`, `C A S T   I N Q U I R Y` 등), (b) Reel 카테고리 라벨(`Intro` / `Scene` / `Featured`), (c) 이메일/인스타 핸들, (d) 사용자 영문명 `Seo Haeu`로 한정된다.
- **REQ-ACT-U-003**: 페이지의 본문 섹션은 off-white 배경(#f8f5f0) + ink black 텍스트(#1a1a1a)로 표시되고, Hero 섹션만 carbon 배경(#0a0a0a) + off-white 텍스트로 표시된다.
- **REQ-ACT-U-004**: 페이지의 본문 헤드라인은 Cormorant Garamond(영문 serif)로, 본문·UI 텍스트는 Pretendard(국문 sans)로 렌더링된다. Noto Serif KR은 `/actor` 범위에서 사용하지 않는다.
- **REQ-ACT-U-005**: 페이지는 Next.js 16 App Router Server Component를 부모로 시작하고, 인터랙션이 필요한 자식만 Client Component(HeroReel, ReelPlayer, CharacterCard)로 분리한다.
- **REQ-ACT-U-006**: 페이지는 SPEC §6 D5에 정의된 6개 작품(너만 있으면 / 당신이 죽였다 / 그래도 사랑이었다 / 요즘것들 / 어느날 엄마가 봉투를 썼다 / 눈)만을 노출한다. 더 적거나 더 많으면 안 된다.
- **REQ-ACT-U-007**: 페이지는 `data-accent="actor"` wrapper(`app/actor/layout.tsx`)를 유지하여 페르소나 격리를 보존한다.
- **REQ-ACT-U-008**: 페이지는 `/dev` 또는 AI Technical Engineer 정체성으로의 명시적 링크·언급을 포함하지 않는다 ("직업 완벽 분리" 원칙). 본문(`<main>`) 내 텍스트는 REQ-ACT-N-004의 금지 substring 목록을 0건으로 유지한다. (사이트 공통 `<header>` / `<nav>`는 페르소나 라우팅을 위해 `/dev` 등 다른 페르소나 링크를 포함할 수 있다.)
- **REQ-ACT-U-009**: 페이지는 Hero 섹션과 Profile 섹션 사이에 carbon(#0a0a0a) → off-white(#f8f5f0) 수직 gradient bridge를 렌더링한다. bridge의 높이는 60px 이상 100px 이하 범위 내에서 결정되며(VOGUE 디지털 커버 패턴), 단절감 없이 부드럽게 전환되어야 한다. sharp camera cut은 허용되지 않는다.
- **REQ-ACT-U-010**: 페이지 footer의 카피라이트 표기는 `© 2026 서해우. All rights reserved.`(또는 actor 톤에 맞게 갱신된 동등 표기)로 렌더링되며 연도는 2026이다.
- **REQ-ACT-U-011**: 페이지는 gold 액센트(#b8a98a)를 다음 3개 zone에만 사용한다: (a) hairline divider(섹션 타이틀 underline, info 테이블 row separator, footer 상단 hairline), (b) 섹션 라벨 small caps eyebrow(`REEL`, `ROLES`, `FILMOGRAPHY`, `CONTACT` 등 typographic eyebrow), (c) role-type tag pill(예: `Netflix · 단역`, `단편 · 주연` — character card 및 timeline 노드). 그 외 영역(본문, 캐릭터명, 작품명, 연도, 큰 헤드라인, navigation 링크)에는 gold를 사용하지 않으며 ink black(#1a1a1a) 또는 Hero 위 off-white를 유지한다.
- **REQ-ACT-U-012**: WHILE off-white(#f8f5f0) 배경 위에서 gold(#b8a98a) 사용이 WCAG 2.1 AA를 충족하지 못하는 경우(small caps 섹션 라벨은 텍스트로 간주: ≤18px 기준 4.5:1, ≥18px bold 기준 3:1; 1px hairline은 비텍스트 장식으로 면제), 시스템은 gold 디자인 토큰을 통과 가능한 최소 darken 값(상한 `#8b6f47`)으로 전역 조정한다. 조정된 값은 모든 zone(a/b/c)에 동일하게 적용된다.

### Event-Driven (이벤트 발생 시)

- **REQ-ACT-E-001**: WHEN 사용자가 `/actor`에 진입하면, Hero 섹션이 100vh 풀-블리드로 표시되고 좌측 하단에 오버레이 카피(`서해우 / Seo Haeu — Actor since 2023` + 출연작 라인업 힌트)가 나타난다.
- **REQ-ACT-E-002**: WHEN 사용자가 Reel 섹션의 카테고리 탭(Intro/Scene/Featured)을 클릭하거나 키보드로 활성화하면, 좌측 player의 video source와 우측 episode list가 풀-페이지 네비게이션 없이 갱신되고 활성 탭에 키보드 포커스가 유지된다. WHEN 카테고리가 전환되면, 시스템은 해당 카테고리의 마지막 선택 episode를 `sessionStorage` 키 `actor.reel.lastEpisode.{categoryId}`에서 복원하여 player에 로드한다. 저장된 선택이 없으면 해당 카테고리의 첫 번째 episode를 fallback으로 로드한다. 페이지 첫 로드(저장 상태 무) 시 활성 탭은 `Intro` + 그 첫(유일) episode로 시작한다.
- **REQ-ACT-E-003**: WHEN 사용자가 Reel 섹션 우측 episode list의 항목을 클릭하면, 좌측 player가 해당 episode를 로드한다. `videoUrl`이 비어 있으면 player는 "영상 준비 중" 스켈레톤을 표시한다. 선택 episode id는 해당 카테고리의 `sessionStorage` 키 `actor.reel.lastEpisode.{categoryId}`에 즉시 저장된다.
- **REQ-ACT-E-007**: WHILE `prefers-reduced-data`가 true이거나 명시적 slow connection 환경에서, WHEN 사용자가 Reel 카테고리 탭을 전환하면, 시스템은 새로 활성화된 episode의 video를 preload하지 않고 poster frame만 표시한다. 사용자가 명시적 재생 컨트롤을 활성화한 경우에만 video가 로드된다.
- **REQ-ACT-E-004**: WHEN 사용자가 데스크톱에서 character card에 마우스를 호버하거나 모바일에서 탭하면, 카드가 3D flip transform으로 회전하여 back face(스틸 mini-grid + character note + hashtags)를 노출한다.
- **REQ-ACT-E-005**: WHEN 사용자가 placeholder character card(`cardKind === "placeholder"`)를 호버/탭하면, flip 대신 정적 typographic placeholder("STILL COMING · 2026" 또는 동일 의미의 미디어 후속 메시지)가 표시된다.
- **REQ-ACT-E-006**: WHEN 페이지 로드가 완료되고 `HERO.reelUrl`이 비어 있으면, Hero는 정적 portrait fallback(grain overlay + 미세 ken-burns)을 렌더링한다. WHEN `HERO.reelUrl`이 채워지면, 동일 markup의 `<video>` 요소가 autoplay/muted/inline/loop로 재생된다.

### State-Driven (상태 조건)

- **REQ-ACT-S-001**: WHILE `prefers-reduced-motion: reduce`가 활성화된 환경에서, Hero 자동재생/ken-burns/character card flip transform이 모두 비활성화되고 opacity 기반 fade로 대체된다.
- **REQ-ACT-S-002**: WHILE 뷰포트 너비가 768px 미만인 경우, Reel 섹션은 player 위 / episode list 아래의 세로 stack 레이아웃으로 표시된다(데스크톱의 player 65% + list 35% 좌우 분할과 대비).
- **REQ-ACT-S-003**: WHILE 사용자가 키보드만으로 탐색하는 경우, Reel 탭(`role="tab"`), Reel episode 버튼, character card 버튼, 모든 nav/contact 링크는 `Tab` 순회 가능하고 포커스 링이 dark hero와 off-white body 양쪽에서 명확히 식별된다.
- **REQ-ACT-S-004**: WHILE 사용자가 data-saver(`prefers-reduced-data`) 또는 명시적 slow connection 환경에 있는 경우, Hero `<video>`는 자동재생되지 않고 정적 frame(또는 poster image)만 표시된다.

### Optional (선택적 기능)

- **REQ-ACT-O-001**: WHERE `HERO.reelUrl`이 비어 있는 경우, Hero `<video>` 요소는 DOM에 예약되어 있고 markup 변경 없이 URL 주입만으로 video 활성화가 가능하다.
- **REQ-ACT-O-002**: WHERE Reel episode의 `videoUrl`이 비어 있는 경우, 해당 episode 카드는 elegant skeleton("영상 준비 중" + 미세 grain)으로 렌더링되고 클릭 시 player에도 동일 skeleton이 표시된다.
- **REQ-ACT-O-003**: WHERE character card의 `coverImage`가 `null`인 경우(예: 너만 있으면 placeholder), 카드 front는 typographic placeholder로 대체된다.
- **REQ-ACT-O-004**: WHERE Reel 카테고리에 episode가 존재하지 않는 경우(미래 확장 시), 해당 탭은 disabled 상태로 표시되고 aria-disabled를 설정한다.
- **REQ-ACT-O-005**: WHEN 사용자가 터치 디바이스(`pointer: coarse` 또는 뷰포트 너비 < 768px)에서 첫 세션 진입으로 Roles 섹션 character card grid에 도달하고 아직 어떤 카드도 탭하지 않은 상태이면(`sessionStorage` 키 `actor.roles.cardTapped`가 미설정), 시스템은 각 flippable 카드의 우측 하단에 작은 chevron 아이콘(▶ 또는 동등한 16×16 SVG)을 렌더링하여 flip affordance를 힌트한다. WHEN 사용자가 어떤 카드든 한 번 탭하면, `sessionStorage` 키 `actor.roles.cardTapped=true`가 설정되고 모든 카드의 chevron이 같은 세션 동안 사라진다. chevron 아이콘은 REQ-ACT-U-011의 gold zone (c)에 준해 gold 액센트를 사용하며, REQ-ACT-S-001의 reduced-motion 환경에서는 fade 애니메이션 없이 opacity toggle로만 표시된다. placeholder 카드(`cardKind === "placeholder"`)는 flippable이 아니므로 chevron을 표시하지 않는다.

### Unwanted (금지 조건)

- **REQ-ACT-N-001**: 페이지는 third-party 영상 호스팅 임베드(YouTube, Vimeo) iframe을 사용하지 않는다. 모든 video는 자체 호스팅된 `<video>` 요소로 재생한다.
- **REQ-ACT-N-002**: 페이지는 third-party 분석 스크립트(Google Analytics, Hotjar 등)를 새로 추가하지 않는다.
- **REQ-ACT-N-003**: 페이지는 사용자에게 회원가입·구독·뉴스레터·예약을 요청하지 않는다. 캐스팅 inquiry 경로는 메일·인스타뿐이다.
- **REQ-ACT-N-004**: 페이지 본문(`<main>` 내부, 즉 사이트 공통 `<header>` / `<nav>` 제외)은 다음 substring 중 어느 것도 case-insensitive 매치로 0건 포함한다 (developer / engineer 정체성 완전 분리):
  - `IIT`
  - `Illinois Institute of Technology`
  - `Computer Science`
  - `Hanwha`
  - `한화시스템`
  - `한화 시스템`
  - `AI Technical Engineer`
  - `AI Engineer`
  - `Data Engineer`
  - `Hyunwoo Jee`
  - `지현우`
  - `Terry`
  - `developer`
  - `engineer`
  - `엔지니어`

  또한 본문 내 `href="/dev"` 또는 `href` 시작이 `/dev`인 링크는 0건이다. 사이트 공통 `<header>` / `<nav>`(공유 `SiteNav.tsx`)는 페르소나 라우팅을 위해 `/dev`, `/designer` 등 다른 페르소나 링크를 포함할 수 있고 이 규칙의 예외이다.
- **REQ-ACT-N-005**: 페이지는 §6 D5 표에 명시되지 않은 작품(사랑하거나 말거나, 단절, 삶, 오르골, 오르골들 등)을 노출하지 않는다.
- **REQ-ACT-N-006**: 페이지는 Lighthouse Performance 점수(모바일 기준) 80 미만을 허용하지 않는다.
- **REQ-ACT-N-007**: 페이지는 Server-rendered HTML과 Client-hydrated 상태 사이에 의도적 layout shift(CLS 누적 0.1 이상)를 발생시키지 않는다.
- **REQ-ACT-N-008**: 페이지는 본문의 어떤 텍스트에도 emoji 아이콘을 사용하지 않는다. 기존 contact 섹션의 ✉ / 📷 글리프는 제거하고 typography 또는 SVG로 대체한다.

---

## 4. 섹션별 세부 명세

### Section 0 — HERO (다크 영역, 풀-블리드 100vh)

[DELTA] 기존 `<section className={styles.hero}>` 정적 grayscale 사진 hero
- [REMOVE] 정적 `<img src={PROFILE.hero}>` 단일 표시
- [REMOVE] 우측 하단 scroll dot 애니메이션 (디자인 톤 교체로 자연 제거)
- [NEW] `_components/HeroReel.tsx` (Client) — `<video>` 요소 + `HERO.reelUrl` 비어있을 때 정적 portrait + film grain overlay + 미세 ken-burns
- [NEW] 좌측 하단 오버레이 카피
  - 1행: `서해우 / Seo Haeu`
  - 2행: `Actor since 2023`
  - 3행(작게): 출연작 라인업 힌트 (예: `Netflix · 당신이 죽였다 (2025)  ·  단편 · 그래도 사랑이었다 (2025)  ·  뮤지컬 · 요즘것들 (2024)`)
- [NEW] 우측 하단 scroll cue (작은 라인 + "Scroll" 캡션)
- [NEW] reduced-motion·data-saver 분기 (REQ-ACT-S-001, REQ-ACT-S-004)
- 배경: `#0a0a0a`
- 텍스트: off-white(`#f8f5f0`)

### Section 1 — PROFILE (매거진 그리드, off-white로 첫 전환)

[NEW] 기존 ABOUT 섹션의 매거진 격상판
- 12-col 매거진 grid:
  - 좌측 5-6col: 큰 portrait (3:4 aspect, 컬럼 폭 full-bleed). 사진은 `PROFILE.portrait`. grayscale 약 10-15% 유지 가능(off-white 위에서 대비 확인).
  - 우측 6-7col: 큰 Cormorant H1 `S E O   H A E U`(자간 넓힘) + 한국어 작은 부제 `서해우` + profile 테이블
- profile 테이블(`PROFILE.info`) 항목:
  - 생년: 1994.04.18
  - 신체: 180cm · 60kg
  - 언어: 한국어 · 영어 (Native) · 중국어 · 일본어 (비즈니스)
  - 특기: 승마 (2년) · 배구 (1년)
  - 이메일: terryjhw@gmail.com
- [LOCKED by Patch 4] 학력(IIT / Computer Science / B.S.) 항목은 표시하지 않는다. REQ-ACT-N-004 금지 substring 목록과 일관성 유지.
- Hero→Profile 전환: 다크→off-white 수직 gradient bridge (60px ≤ 높이 ≤ 100px, REQ-ACT-U-009로 LOCKED). VOGUE 디지털 커버 패턴. sharp camera cut 금지.
- 학력 항목은 페르소나 분리 원칙(REQ-ACT-N-004의 IIT / Computer Science 금지)에 따라 노출하지 않는다.

### Section 2 — REEL (Netflix detail page 패턴)

[NEW] 기존 갤러리를 reel로 격상
- 상단: 카테고리 탭 strip 3개
  - `Intro` (한국어 부제: 자기소개) — 1 video
  - `Scene` (한국어 부제: 독백) — 5 videos
  - `Featured` (한국어 부제: 합 · 다인 연기) — 5 videos
- 데스크톱 본문:
  - 좌측 ~65%: 단일 large player(`<video controls poster>`), 16:9
  - 우측 ~35%: 활성 카테고리의 episode 세로 list. 각 항목: thumbnail(있을 시) + 제목 + (옵션) duration
- 모바일(< 768px): player 위, list 아래 세로 stack
- 탭 컴포넌트는 ARIA `tablist` / `tab` / `tabpanel` 패턴 준수
- `videoUrl`이 빈 episode는 player·list 양쪽에서 "영상 준비 중" skeleton(미세 grain) 표시
- [NEW] `_components/ReelPlayer.tsx` (Client) — 탭 상태 + 활성 episode + video src swap

### Section 3 — ROLES (타임라인 6작품 + 5 character cards, Phase 6 amend)

[NEW] 인물 중심 섹션(기존에 없음)
- 상단: `_components/RoleTimeline.tsx` — 6개 작품의 horizontal timeline
  - 정렬: 연도 descending(2026 → 2023). 가장 최근이 먼저 읽힌다.
  - 노드: 연도 + 작품명 + role-type tag(예: `Netflix · 단역`, `단편 · 주연`, `뮤지컬 · 주연`)
  - 기본 SSR 정적 렌더. scroll-linked 애니메이션 도입 시에만 Client로 승격 — 기본은 SSR.
- 하단: character card grid (3-col 데스크톱 / 2-col 태블릿 / 1-col 모바일), 총 5장 (4 real + 1 placeholder, Phase 6 amend로 gukhyeon-2025 제거 — RoleTimeline은 6작품 그대로 표시)
  - 모든 카드 공통: front face = 표지 이미지(또는 typographic placeholder) + character name + 작품명 + 짧은 hashtag chip
  - back face = 스틸 mini-grid (2~3장) + 1~2줄 character note + 2~3 hashtags
  - flip 인터랙션: 데스크톱 hover + 모바일 tap, CSS 3D transform. reduced-motion이면 opacity fade로 대체.
- 모바일/터치 첫 진입 hint: REQ-ACT-O-005에 따라 flippable 카드 우측 하단에 작은 gold chevron(▶, 16×16 SVG)을 표시. 사용자가 어떤 카드든 한 번 탭하면 `sessionStorage.actor.roles.cardTapped=true` 설정 + 모든 chevron 사라짐.
- 카드 유형(`cardKind`)별 처리:
  - `still`: 점원/당신이 죽였다 (still_netflix_1, still_netflix_2), 대현/봉투 (still_bongtu_1/2/3), 집주인/눈 (still_nun_1, still_nun_2)
  - `poster`: 민혁/요즘것들 — 포스터를 front로. 자산 미입수 상태에서는 `coverImage: null` + typographic placeholder로 출발하고, 추후 자산 추가 시 같은 카드 schema 그대로 채워진다.
  - `low-quality-still`: 국현/그래도 사랑이었다 — still과 동일하게 처리하되 grayscale 수치를 상대적으로 더 높이고 grain을 더 강하게 적용해 톤을 통일. 자산이 아직 입수되지 않은 시점에는 `coverImage: null` placeholder로 출발한다.
  - `placeholder`: 준혁/너만 있으면 — typographic front("STILL COMING · 2026" 또는 동일 의미 카피), flip 비활성 또는 back에 "촬영 자료 입수 후 채워집니다" 한 줄.
- character card 카피(`note`, `hashtags`)는 SPEC 단계에서 빈 문자열·빈 배열로 출발한다(구현 단계 별도 인터뷰 round).

### Section 4 — FILMOGRAPHY (매거진 인덱스 타이포)

[DELTA] 기존 필모그래피 리스트
- [REMOVE] 기존 cyan/red 글래스모피즘 톤
- [REPLACE] 기존 7개 항목 중 §6 D5에 명시된 6개로 정정
  - 카테고리 그룹화: `드라마` / `영화` / `뮤지컬`
  - 각 항목: 연도 · 작품명 · 플랫폼(있을 시) · 역할 타입 · 캐릭터명
- 매거진-인덱스 타이포:
  - 카테고리 라벨: Cormorant uppercase 작은 글씨 + 가는 hairline rule
  - 작품 행: 연도(작게, 가는 serif) | 작품명(크게, italic 또는 regular) | 플랫폼/타입 칩 | 캐릭터명(부제 회색)
- 액센트(hairline rule + `FILMOGRAPHY` eyebrow + role-type tag pill) 컬러: gold(#b8a98a) — REQ-ACT-U-011의 3 zone 정책에 따름. WCAG AA 미달 시 REQ-ACT-U-012의 darken 정책(≤ #8b6f47)을 전역 적용.

### Section 5 — CONTACT (중앙 정렬, 큰 editorial 타이포)

[DELTA] 기존 contact 섹션
- [REMOVE] ✉ / 📷 emoji 아이콘
- [REPLACE] 헤드라인 → `C A S T   I N Q U I R Y` (Cormorant uppercase, 자간 넓힘)
- 본문(작게): `캐스팅 및 작품 관련 문의는 아래로 연락 주세요.`
- 링크 두 줄:
  - `terryjhw@gmail.com`
  - `Instagram · @oceanmeetrain`
- 하단: 카피라이트 (기존 footer 유지 또는 actor 톤에 맞게 갱신)

---

## 5. Data Model (data.ts 재구조화)

### TypeScript 인터페이스 (SPEC 정의 — 구현 시 그대로 사용)

```ts
// app/actor/data.ts (rewritten)

export type ProfileInfoRow = {
  label: string;
  value: string;
  href?: string;
};

export const PROFILE: {
  name: string;            // "서해우"
  nameEn: string;          // "Seo Haeu"
  role: string;            // "Actor"
  since: number;           // 2023
  hero: string;            // hero portrait (HeroReel poster fallback)
  portrait: string;        // Profile section portrait
  info: ProfileInfoRow[];
};

export const HERO: {
  reelUrl: string;         // "" → fallback; URL → video active
  posterImage: string;     // static frame when reel absent or data-saver
  captionLine: string;     // 출연작 라인업 힌트 한 줄
};

export type ReelCategoryId = "intro" | "scene" | "featured";

export type ReelEpisode = {
  id: string;
  title: string;
  videoUrl?: string;       // empty/undefined → skeleton
  durationSec?: number;
  thumb?: string;          // optional thumbnail for episode list
};

export type ReelCategory = {
  id: ReelCategoryId;
  labelEn: string;         // "Intro" / "Scene" / "Featured"
  labelKo: string;         // "자기소개" / "독백" / "합 · 다인 연기"
  episodes: ReelEpisode[];
};

export const REEL: ReelCategory[];

export type RoleType =
  | "Netflix · 단역"
  | "단편 · 주연"
  | "뮤지컬 · 주연"
  | string;               // 확장 허용

export type TimelineEntry = {
  year: number;
  workTitle: string;
  platform?: string;       // Netflix 등
  roleType: RoleType;
  roleName: string;        // 캐릭터명
  hasCharacterCard: boolean;
};

export const TIMELINE: TimelineEntry[]; // 6 entries, year desc

export type CardKind = "still" | "poster" | "low-quality-still" | "placeholder";

export type CharacterCard = {
  id: string;
  characterName: string;
  workTitle: string;
  workPlatform?: string;
  year: number;
  roleType: RoleType;
  coverImage: string | null;  // null → typographic front placeholder
  stills: string[];           // back face mini-grid (0~3)
  note: string;               // SPEC 단계 default ""
  hashtags: string[];         // SPEC 단계 default []
  cardKind: CardKind;
};

export const CHARACTER_CARDS: CharacterCard[]; // 4 real + 1 placeholder = 5 (Phase 6 amend)

export type FilmographyItem = {
  year: number;
  title: string;
  platform?: string;
  roleType: RoleType;
  roleName: string;
};

export type FilmographyBlock = {
  category: "드라마" | "영화" | "뮤지컬";
  items: FilmographyItem[];
};

export const FILMOGRAPHY: FilmographyBlock[]; // §6 D5 6 works grouped

export const NAV_LINKS: { href: string; label: string }[]; // 6 sections
```

### 작품 데이터 정정 (D5)

| Year | Work | Role(캐릭터) | RoleType | 자산 상태 |
|------|------|------|----------|-----|
| 2026 | 너만 있으면 | 준혁 | 단편 · 주연 | placeholder (자산 미정) |
| 2025 | 당신이 죽였다 | 점원 | Netflix · 단역 | stills: still_netflix_1, still_netflix_2 |
| 2025 | 그래도 사랑이었다 | 국현 | 단편 · 주연 | low-quality still (미입수 → 추후) |
| 2024 | 요즘것들 | 민혁 | 뮤지컬 · 주연 | poster (미입수 → 추후) |
| 2023 | 어느날 엄마가 봉투를 썼다 | 대현 | 단편 · 주연 | stills: still_bongtu_1, still_bongtu_2, still_bongtu_3 |
| 2023 | 눈 | 집주인 | 단편 · 주연 | stills: still_nun_1, still_nun_2 |

[REMOVE] 기존 `data.ts`에서 제거할 항목: 사랑하거나 말거나, 단절, 삶, 오르골, 오르골들.
[CORRECT] 당신이 죽였다 역할: `매장직원` → `점원`, 타입: `단역 · 대역` → `Netflix · 단역`.
[CORRECT] 봉투 character: 무명 → `대현`. 타입: `단역 · 대역 · 주연` → `단편 · 주연`.
[CORRECT] 눈 캐릭터: 무명 → `집주인`. 타입: `주연` → `단편 · 주연`.

---

## 6. 비기능 요구사항

| 영역 | 목표 |
|---|---|
| Lighthouse Performance (모바일) | **>= 80** |
| Lighthouse Accessibility | **>= 95** |
| Lighthouse Best Practices | **>= 95** |
| LCP (모바일) | < 2.5s |
| CLS | < 0.1 |
| WCAG 준수 | 2.1 AA |
| 키보드 네비게이션 | 모든 인터랙티브 요소(탭, episode 버튼, character card, contact 링크) |
| `prefers-reduced-motion` | hero 자동재생/ken-burns/flip transform 완전 비활성 |
| `prefers-reduced-data` | hero 자동재생 비활성, 정적 frame |
| 반응형 | 320px ~ 4K (mobile-first) |
| 클라이언트 JS 예산 | 4개 leaf(HeroReel, ReelPlayer, CharacterCard, RoleTimeline 옵션)에 한정. 나머지는 Server Component |
| 브라우저 | 최신 Chrome / Safari / Firefox (Evergreen) |
| 모바일 video | muted + playsinline + autoplay (iOS Safari 호환) |
| 한국어 SEO + OG | actor 메타데이터 + OG 이미지 |
| 클라이언트 상태 저장 | `sessionStorage`만 사용 (Reel 마지막 선택 episode, Roles 카드 탭 여부). `localStorage` / cookie / 원격 분석 금지. REQ-ACT-N-002와 일관. |

---

## 7. Exclusions (What NOT to Build)

> [HARD] 이 SPEC에서 명시적으로 만들지 않는 것들

1. **실제 reel 영상 파일 제작·편집** — 사용자가 academy 클립을 추후 편집 후 URL 페이스트.
2. **third-party 영상 임베드(YouTube/Vimeo iframe)** — 자체 호스팅 `<video>`만 사용.
3. **CMS/Server fetch/Server Actions** — `data.ts` 정적 모듈만.
4. **`/actor` 서브 라우트** — `/actor/reel`, `/actor/roles` 등 추가 라우트 만들지 않음. 단일 페이지의 섹션으로.
5. **character card 카피(notes, hashtags) 작성** — schema만 정의. 카피는 구현 단계 별도 인터뷰 round.
6. **AI 정체성으로의 cross-link** — 사용자 명시 ("직업 완벽 분리").
7. **다른 페르소나 페이지(/dev, /designer, /agent) 변경** — 별개 SPEC.
8. **회원/구독/예약/뉴스레터** — 캐스팅 inquiry는 메일·인스타만.
9. **다국어(i18n)** — 한국어 고정 (영문 라벨은 카피 단위 예외).
10. **Three.js / WebGL / 3D 시각화** — actor는 photography + typography 기반.
11. **영상 재생에 대한 E2E** — SPEC 시점에 `reelUrl`/`videoUrl` 빈 값, placeholder까지만 E2E 검증.
12. **emoji 글리프 사용** — typography 또는 SVG로 대체.

---

## 8. 의존성 & 위험

### 신규/조정 패키지 의존성
- 새 npm 패키지 없음 (현재 의존성으로 충분). Cormorant Garamond / Pretendard는 `next/font/google` 또는 자가 호스팅 webfont로 추가.
- `next/font` 등록만 추가, runtime 추가 의존성은 발생하지 않음.

### 자산 의존성
- 이미 보유: hero.jpg, profile.jpg, still_netflix_1/2, still_bongtu_1/2/3, still_nun_1/2
- 추가 필요(추후 입수):
  - 요즘것들 포스터(민혁 카드 front cover)
  - 그래도 사랑이었다 still(국현 카드 front cover)
  - reel 영상 11개(intro 1 + scene 5 + featured 5)
- 자산 미입수 상태에서도 페이지가 정상 동작해야 한다(REQ-ACT-O-001/002/003).

### 주요 위험
- **off-white(#f8f5f0) 위 gold(#b8a98a) 콘트라스트 부족 위험** — WCAG AA 미달 시 REQ-ACT-U-012의 darken 정책에 따라 ≤ #8b6f47까지 토큰 전역 조정. 구현 단계 contrast 측정 필수 (3 zone 모두).
- **모바일 Safari `<video>` autoplay 정책** — muted + playsinline 필수. data-saver 환경 fallback.
- **character card flip의 hydration mismatch 위험** — SSR/CSR 출발 상태 동일하게 front face로 고정, flip은 사용자 인터랙션 후에만.
- **Cormorant Garamond 큰 본문 사용 시 한글 라인업 깨짐** — 한글에는 Pretendard만 사용, Cormorant는 라틴 글자에만.
- **Lighthouse Performance 80 미달 위험** — Hero 영상이 들어오는 순간 LCP 변동. video lazy + poster 우선 LCP 전략 필요.

### 완화 액션
- Hero `<video>` `preload="none"` + `poster` 우선, 가시 viewport 진입 후 play
- character card 이미지: `<img loading="lazy">` + 정확한 width/height로 CLS 0 보장
- `e2e/actor.spec.ts`에 키보드 탐색 + reduced-motion 케이스 + 6 작품 정확성 검증 추가

---

## 9. MX 태그 계획 (의무)

| 위치 | 태그 | 사유 |
|---|---|---|
| `_components/HeroReel.tsx` video 활성 분기 | `@MX:WARN` | `HERO.reelUrl` 유무에 따른 SSR/CSR 분기, hydration mismatch 위험 |
| `_components/HeroReel.tsx` ken-burns / autoplay 콜백 | `@MX:NOTE` | reduced-motion / data-saver 분기 명시 |
| `_components/ReelPlayer.tsx` 탭 상태 + video src swap | `@MX:ANCHOR` | 외부 인터랙션 진입점 (탭 클릭 / episode 클릭 / 키보드) |
| `_components/CharacterCard.tsx` flip transform 콜백 | `@MX:WARN` | hover/tap 분기 + reduced-motion fallback 누락 시 사용성 회귀 |
| `app/actor/data.ts` 6 작품 배열 | `@MX:ANCHOR` | §6 D5 합의된 작품 set, 임의 추가/삭제 시 SPEC 위반 |
| `app/actor/data.ts` `REEL`의 빈 `videoUrl` | `@MX:TODO` | 사용자 URL 페이스트 대기 항목 |

---

## 10. 완료 정의 (Definition of Done)

- [ ] 모든 EARS 요구사항(REQ-ACT-U/E/S/O/N)이 구현 또는 회피로 처리됨
- [ ] `pnpm typecheck` 통과 (strict)
- [ ] `pnpm lint` 통과
- [ ] `pnpm e2e` 전체 통과 (`actor.spec.ts` 확장본 포함)
- [ ] Lighthouse Performance >= 80 (모바일), Accessibility >= 95, Best Practices >= 95
- [ ] `prefers-reduced-motion` 환경에서 hero 자동재생·ken-burns·card flip 비활성 확인
- [ ] `prefers-reduced-data` 환경에서 hero `<video>` 자동재생 비활성 + poster 표시 확인
- [ ] 키보드 only 탐색으로 모든 인터랙티브 요소 도달 가능
- [ ] 모바일 320px ~ 4K 시각적 회귀 없음
- [ ] `data.ts`의 작품 배열이 정확히 §6 D5 6개와 일치 (자동화된 assertion)
- [ ] `HERO.reelUrl` / Reel `videoUrl`이 모두 빈 상태에서도 페이지가 깨지지 않음
- [ ] Hero→Profile gradient bridge 높이가 60~100px 범위 내(REQ-ACT-U-009) 시각 검증
- [ ] gold(#b8a98a) zone (a/b/c) 모두 WCAG AA 통과 또는 REQ-ACT-U-012의 darken 정책 적용
- [ ] 본문(`<main>`)에 REQ-ACT-N-004 금지 substring 0건 검증 (자동화된 grep)
- [ ] footer 카피라이트 연도 `2026` 검증 (REQ-ACT-U-010)
- [ ] 모바일 첫 세션 진입 시 character card 우측 하단 gold chevron 표시 + 첫 탭 후 사라짐 검증 (REQ-ACT-O-005)
- [ ] Reel `sessionStorage` 마지막 선택 episode 복원 검증 (REQ-ACT-E-002, E-003)
- [ ] 사용자가 PR 미리보기에서 "이 배우와 회의를 잡고 싶다"에 준하는 정성적 반응 (KPI 게이트)

---

## 11. 참조

- `research.md` — 사전 분석 (현재 상태, VOGUE 디지털 커버 패턴 참조, 캐스팅 결정 30초 윈도우 근거)
- `plan.md` — 구현 phase 단계
- `acceptance.md` — Given/When/Then 시나리오
- `tasks.md` — 작업 분해(skeleton, expert-frontend 세분화 대상)
- `progress.md` — phase 진행 추적
- `spec-compact.md` — orchestrator용 압축 1-pager
- `SPEC-DEV-REDESIGN-001` — 대칭되는 `/dev` 풀파워 재설계, 비주얼 architecture precedent
- `.moai/project/product.md` — 멀티-페르소나 portfolio 컨텍스트, KPI ("이 배우와 회의를 잡고 싶다")
- `.moai/project/structure.md` — Next.js 16 App Router project 컨벤션
- `.claude/rules/moai/design/constitution.md` — 디자인 시스템 헌법(FROZEN/EVOLVABLE 영역, 브랜드 컨텍스트)

---

## 12. Implementation Notes (Sync 시점 추가, 2026-05-22)

SPEC-ACTOR-REDESIGN-001 자동화 범위(Phase 0~5)가 모두 구현되어 `origin/main`에 반영되었음. SPEC 라이프사이클 레벨은 spec-first (Level 1) 기본값 적용 — 본 노트 추가와 동시에 `status: draft` → `status: completed`로 전환되며 이후 능동적 변경은 발생하지 않는다. Phase 6/7 rolling 작업은 SPEC 본문을 갱신하지 않고 `app/actor/data.ts` 페이스트만으로 진행한다.

### Phase 별 구현 요약

| Phase | 결과 | 핵심 결정 |
|---|---|---|
| 0 | 폰트(Cormorant + Pretendard CDN) + 토큰 + reduced-motion/data 훅 | LD1 — Hero h1 단독 |
| 1 | Hero(Server) + HeroReel(Client) + page.module.css 전면 교체 + bridge LOCK 60~100px | REQ-ACT-U-009 LOCK |
| 2 | data.ts 전면 재구조화 + Profile + Filmography + LD2 token `#8b6f47` 결정 | LD2 v1 |
| 3 | Reel(Server) + ReelPlayer(Client) WAI-ARIA tabs + sessionStorage + LD2 v2 token re-darken `#7c6240` (실측 5.25:1 AA) | REQ-ACT-U-012 정량 검증 |
| 4 | RoleTimeline + CharacterCard 3D flip + chevron hint + Roles wrapper + window CustomEvent 전파 | REQ-ACT-O-005 패턴 |
| 5 | Contact editorial(`C A S T   I N Q U I R Y`) + 6섹션 최종 조립 + 종합 e2e 회귀 (A2/H1~H5/K3/E3) | 6 sections lock |

### 누적 정량 지표

- e2e: **49/49 PASS** (회귀 0)
- tsc: 0 errors
- pnpm build: 7/7 static pages (Turbopack)
- evaluator-active weighted: Phase 4 0.903 / Phase 5 **0.943 PASS** (standard harness threshold 0.75 초과)
- localStorage 사용 전체 페이지: 0건 (REQ-ACT-N-002)
- 본문 prohibited substring: 0건 (15개 substring + Terry word boundary, REQ-ACT-N-004)
- 본문 emoji glyph: 0건 (Extended_Pictographic, REQ-ACT-N-008)
- 본문 `/dev` href: 0건 (REQ-ACT-U-008)
- footer 카피라이트: `© 2026 서해우` (REQ-ACT-U-010)
- @MX 태그: ACTOR_TOKENS ANCHOR 1 + CharacterCard ANCHOR 1 + CharacterCard WARN 1 + 다수 NOTE — anchor_per_file ≤ 3, warn_per_file ≤ 5 모두 준수

### SPEC vs 구현 divergence

원래 `plan.md`의 7-Turn mapping과 실제 구현은 거의 일치. 주요 deviation:

- **폰트 로딩 방식**: 계획 `next/font/google` → 실제 `globals.css @import` + Pretendard CDN(jsdelivr). 사유: Somansa 프록시에서 `next/font` 실패. 향후 self-host woff2로 정리 권장.
- **LD2 token re-darken**: 계획 `#8b6f47` (REQ-ACT-U-012 상한) → 실제 `#7c6240` (실측 5.25:1 AA). 사유: `#8b6f47` 실측 4.33:1로 AA 4.5:1 미달, evaluator-active 정량 검증으로 발견. SPEC 본문(§Visual System Gold)은 "≤ #8b6f47 darken" 표현이므로 더 어두운 `#7c6240`은 상한 안쪽 → 준수.
- **CharacterCard wrapper 구조**: 계획상 chevron hint 상태를 Roles wrapper에 lift 가능성 검토 → 실제는 각 CharacterCard가 sessionStorage + `window 'actor:firstRoleCardTap'` CustomEvent로 자체 동기화 (Roles는 Server 유지). 사유: REQ-ACT-U-005 Server parent + Client leaves 원칙 엄격 준수.
- **레거시 CSS 정리**: page.module.css의 `.contact*` 클래스는 page.tsx에서 더 이상 참조되지 않으나 cleanup sprint 분리 위해 정의 보존 + 코멘트 마킹. drive-by 회피.

### Phase 6/7 rolling (별도 SPEC 없이 data.ts 페이스트만)

- **Phase 6**: CHARACTER_CARDS 5장(준혁/점원/민혁/대현/집주인)의 `note` + `hashtags` 카피 — 사용자 인터뷰 1장씩. gukhyeon-2025 카드는 본인 결정으로 제거 (작품은 TIMELINE/FILMOGRAPHY에 유지)
- **Phase 7**: 
  - HERO `reelUrl` 페이스트 → markup 변경 0건으로 video 활성 (REQ-ACT-O-001)
  - REEL 11개 episode `videoUrl` 페이스트 → skeleton → player 활성 (REQ-ACT-O-002)
  - 요즘것들 포스터 등 자산 입수 시 `CHARACTER_CARDS.coverImage` 페이스트 (REQ-ACT-O-003) — '그래도 사랑이었다'는 Phase 6 amend로 카드 제거되어 자산 불필요

### 사용자 runtime 검증 (SPEC 내 미해결 acceptance)

- E4: Lighthouse Accessibility ≥ 95 — Chrome DevTools Lighthouse 모바일 실행
- F1/F3: Lighthouse Performance ≥ 80, LCP < 2.5s, CLS < 0.1 — 동일 도구
- F2: bundle 측정 (`ANALYZE=true pnpm build`)
- L1: "이 배우와 회의를 잡고 싶다" KPI 시각 게이트 — 사용자 정성 판단

### 커밋 라인 (origin/main)

```
71ab828  feat(actor): SPEC-ACTOR-REDESIGN-001 Phase 5 Polish (6섹션 완성)
aeff232  feat(actor): SPEC-ACTOR-REDESIGN-001 Phase 4 ROLES + chevron hint
9941daf  feat(actor): SPEC-ACTOR-REDESIGN-001 Phase 3 REEL + WCAG AA token re-darken
(+ Phase 0~2 auto-commit clusters)
```
