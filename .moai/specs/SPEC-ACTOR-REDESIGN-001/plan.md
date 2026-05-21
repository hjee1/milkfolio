# Plan — SPEC-ACTOR-REDESIGN-001

`/actor` 풀파워 재설계의 구현 계획. spec.md의 EARS 요구사항을 phase 단위 작업으로 분해. 시간 추정은 사용하지 않고 priority + 의존 순서로 정렬.

---

## 0. 사전 준비 (Phase 0)

### 0.1 폰트 등록
- `app/layout.tsx` 또는 `app/actor/layout.tsx`에서 `next/font/google`로 추가:
  - **Cormorant Garamond** (라틴 serif headlines)
  - **Pretendard** (국문 sans 본문/UI) — Google Fonts 미제공 시 자가 호스팅 webfont 등록
- 기존 글로벌 폰트 변수에서 `--font-serif-ko` (Noto Serif KR)는 actor 범위 내에서만 미사용 처리. 다른 페르소나에 영향 금지.
- 폰트 priority loading 확인 (Cormorant subset Latin only, Pretendard subset Korean).

### 0.2 토큰 정의
- `app/actor/_components/shared/tokens.ts` 신규
  - 색상: `--actor-bg-body` (#f8f5f0), `--actor-bg-hero` (#0a0a0a), `--actor-ink` (#1a1a1a), `--actor-ink-soft` (#4a4a4a), `--actor-rule` (#d4ccbe), `--actor-accent-gold` (#b8a98a, 콘트라스트 확인 후 hairline 한정)
  - 폰트: `--actor-font-display`, `--actor-font-body`, `--actor-font-mono`
  - 간격: magazine grid gap, 섹션 vertical rhythm
- contrast 측정 (off-white 위 #b8a98a) → AA 미달 시 hairline 액센트만 사용, 본문은 ink 통일.

### 0.3 디렉터리 구조 셋업
```
app/actor/
├── layout.tsx (메타 업데이트)
├── page.tsx (Server, 6섹션 조합)
├── page.module.css (전면 교체)
├── data.ts (전면 재구조화)
└── _components/
    ├── Hero.tsx + Hero.module.css (Server)
    ├── HeroReel.tsx + HeroReel.module.css (Client)
    ├── Profile.tsx + Profile.module.css (Server)
    ├── Reel.tsx + Reel.module.css (Server)
    ├── ReelPlayer.tsx + ReelPlayer.module.css (Client)
    ├── Roles.tsx + Roles.module.css (Server)
    ├── RoleTimeline.tsx + RoleTimeline.module.css (Server, SSR 정적)
    ├── CharacterCard.tsx + CharacterCard.module.css (Client, flip)
    ├── Filmography.tsx + Filmography.module.css (Server)
    ├── Contact.tsx + Contact.module.css (Server)
    └── shared/
        ├── tokens.ts
        ├── usePrefersReducedMotion.ts
        └── usePrefersReducedData.ts
```

### 0.4 자산 인벤토리 확인
- 기보유: `public/actor/assets/hero.jpg`, `profile.jpg`, `still_netflix_1.jpg`, `still_netflix_2.jpg`, `still_bongtu_1.jpg`, `still_bongtu_2.jpg`, `still_bongtu_3.jpg`, `still_nun_1.jpg`, `still_nun_2.jpg`
- 미보유(추후 입수): 요즘것들 포스터, 그래도 사랑이었다 still, reel 영상 11개
- 미보유 자산은 SPEC schema(REQ-ACT-O-001/002/003)에 의해 placeholder로 출발

---

## 1. Phase 1 — 비주얼 시스템 & Hero shell

[Priority: High] 페이지의 톤이 결정되는 phase. 이후 phase의 시각적 일관성을 좌우.

### 1.1 비주얼 시스템 정의
- `app/actor/page.module.css` 전면 교체 — off-white 본문 + carbon hero
- 매거진 12-col grid 시스템 (`grid-template-columns: repeat(12, minmax(0, 1fr))`)
- 섹션별 vertical rhythm (예: hero 100vh, 본문 섹션 96~128px padding)
- typography scale (Cormorant display H1~H3, Pretendard body 14/16/18)
- hero→profile 수직 fade bridge (~80px gradient `#0a0a0a` → `#f8f5f0`)

### 1.2 Hero shell 구현
- `Hero.tsx` (Server) — 큰 골격 + 좌측 하단 카피 오버레이 (한국어 카피는 SSR로 LCP 안정화)
- `HeroReel.tsx` (Client) — `<video>` 요소 + `HERO.reelUrl` 분기:
  - 빈 값 → `<img>` poster (PROFILE.hero) + grain overlay + 미세 ken-burns(reduced-motion 시 정지)
  - URL 채워짐 → `<video autoPlay muted playsInline loop preload="none" poster={posterImage}>`
- `usePrefersReducedMotion`, `usePrefersReducedData` 훅 분기
- 우측 하단 scroll cue (작은 라인 + "Scroll")
- `@MX:WARN` 태그 부착 (REQ-ACT-O-001 contract)

### 1.3 layout.tsx 메타 업데이트
- title: "서해우 — Actor"
- description: 캐스팅 inquiry용 한국어 한 줄
- OG image: hero.jpg (또는 동일 톤 별도)
- `data-accent="actor"` wrapper 유지

---

## 2. Phase 2 — PROFILE + FILMOGRAPHY (서버 렌더)

[Priority: High] SSR-only, 클라이언트 JS 0. 페이지 내용의 핵심 정보 밀도.

### 2.1 data.ts 재구조화
- 기존 `FilmographyItem` / `GalleryItem` 타입 폐기
- 신규 타입(SPEC §5) 정의: PROFILE / HERO / REEL / TIMELINE / CHARACTER_CARDS / FILMOGRAPHY / NAV_LINKS
- §6 D5 6개 작품 데이터 입력 (캐릭터명·역할 타입 정정)
- 기존 GALLERY는 제거(자산 reference는 CHARACTER_CARDS / REEL로 흡수)
- `@MX:ANCHOR` 태그 — 6개 작품 set (SPEC 합의)

### 2.2 Profile 섹션
- `Profile.tsx` (Server) — 12-col grid: 좌 5-6col portrait, 우 6-7col Cormorant H1 + table
- portrait는 `<img loading="eager">` (above-the-fold)
- 큰 영문 H1 `S E O   H A E U` (Cormorant, letter-spacing 0.3em+)
- 한국어 부제 `서해우`
- profile 테이블: `PROFILE.info` 매핑, hairline border, Pretendard 14-16px

### 2.3 Filmography 섹션
- `Filmography.tsx` (Server) — `FILMOGRAPHY` 블록 순회
- 카테고리 라벨 (드라마/영화/뮤지컬): Cormorant uppercase 작은 글씨 + hairline rule
- 행: 연도 | 작품명(italic 또는 regular) | 플랫폼 chip | roleType | 캐릭터명(회색 부제)
- hover 인터랙션은 옵션(매거진 톤 유지 위해 최소화)

### 2.4 페이지 조립 1차
- `page.tsx`에 Hero + Profile + Filmography 만 우선 조합 → 비주얼 톤·전환 검증
- `pnpm dev`로 로컬 시각 확인
- Hero→Profile dark→off-white 전환 fade bridge 시각 확인

---

## 3. Phase 3 — REEL Client component

[Priority: High] 가장 큰 인터랙션 위험 + 가장 큰 임팩트.

### 3.1 Reel 섹션 골격 (Server)
- `Reel.tsx` (Server) — REEL 데이터를 ReelPlayer로 전달
- 섹션 헤더(예: `Reel` 또는 `Selected Work`) + 짧은 부제

### 3.2 ReelPlayer (Client)
- `ReelPlayer.tsx` (Client) — `"use client"`
- React state: `activeCategoryId`, `activeEpisodeId`
- 탭 strip: `role="tablist"`, 각 탭 `role="tab"` + `aria-selected` + `aria-controls`
- 좌측 player: `<video controls poster={activeEpisode.thumb}>`
- 우측 episode list: `role="tabpanel"` 안의 버튼 list
- `videoUrl`이 빈 episode → player·list 양쪽 skeleton ("영상 준비 중" + grain)
- 카테고리 전환 시 첫 episode 자동 선택 (또는 마지막 선택 유지 — UX 결정은 구현 시 단순한 쪽 채택)
- 키보드 패턴 (WAI-ARIA tabs):
  - Tab으로 탭 strip 진입
  - 활성 탭에서 좌/우 화살표로 카테고리 전환
  - Tab으로 episode list 진입, Enter/Space로 선택
- `@MX:ANCHOR` — 외부 인터랙션 진입점

### 3.3 모바일 stack
- `Reel.module.css` `@media (max-width: 768px)` → player 위, list 아래 세로 stack
- player aspect-ratio 16/9 유지

### 3.4 page.tsx 조립 2차
- 1차에 Reel 추가, 카테고리 탭 전환 / episode 선택 / skeleton 표시 시각 확인

---

## 4. Phase 4 — ROLES (Timeline + Character Cards)

[Priority: High] 인물 중심 단면. 캐스팅 디렉터가 "이 배우가 어떤 역할 폭을 가지는가"를 판단하는 핵심 섹션.

### 4.1 RoleTimeline (Server)
- `RoleTimeline.tsx` (Server) — TIMELINE 데이터를 horizontal SVG 또는 flex row로 렌더
- 연도 descending (2026 → 2023)
- 노드: 연도 + 작품명 + roleType tag
- scroll-linked 애니메이션은 채택하지 않음(기본 SSR 정적). 채택 시에만 Client 승격.

### 4.2 CharacterCard (Client)
- `CharacterCard.tsx` (Client) — `"use client"`
- props: `CharacterCard` (data.ts 타입)
- React state: `flipped: boolean`
- 데스크톱: hover 시 `flipped = true`
- 모바일/터치: tap 시 toggle
- CSS 3D transform: `transform-style: preserve-3d` + front/back 회전 180deg
- reduced-motion 분기:
  - flip transform 제거
  - opacity fade로 back face 전환
- `cardKind === "placeholder"` 분기:
  - front: typographic "STILL COMING · 2026"
  - flip 비활성 (또는 back에 한 줄 메시지)
- `coverImage === null` 분기:
  - front: typographic placeholder (작품명 + roleType)
- 키보드 활성화: 카드 자체가 `<button>` 또는 `role="button" tabindex="0"`, Enter/Space로 flip toggle
- `@MX:WARN` — hover/tap 분기 + reduced-motion fallback

### 4.3 Roles 섹션 조립
- `Roles.tsx` (Server) — RoleTimeline 위에, CharacterCard grid 아래
- grid: 데스크톱 3-col, 태블릿 2-col, 모바일 1-col
- 6장 모두 렌더 (5 real + 1 placeholder)

### 4.4 page.tsx 조립 3차
- Hero / Profile / Reel / Roles / Filmography / Contact 모두 조합

---

## 5. Phase 5 — Polish: 전환 / 접근성 / 성능

[Priority: High] 게이트.

### 5.1 hero→profile 전환 polish
- 80px vertical fade bridge 시각 검증
- Safari/Chrome/Firefox 비교 (gradient banding 없음 확인)
- 모바일에서도 전환 자연스러움 확인

### 5.2 접근성 검증
- 키보드 only 탐색 시 모든 인터랙티브 요소 도달 가능 (REQ-ACT-S-003)
- 포커스 링 dark/off-white 양쪽에서 명확 (high-contrast outline)
- WCAG 2.1 AA (Lighthouse Accessibility >= 95, axe-core 0 violations)
- ARIA 패턴 검증: Reel tablist, character card button, video controls
- 모든 `<img>`에 의미있는 alt
- reduced-motion 시뮬레이션 (Playwright `emulateMedia`)
- 헤딩 위계 (h1 = Profile의 `S E O   H A E U`, 섹션 h2)

### 5.3 성능 검증
- Lighthouse 모바일 Performance >= 80
- LCP < 2.5s (Hero poster 우선 렌더, video preload=none)
- CLS < 0.1 (모든 이미지에 width/height, video aspect-ratio CSS)
- 초기 JS: Client leaf 4개 합산 측정 (목표: 가능한 한 작게)
- 모바일 hero `<video>` 자동재생 정책 확인

### 5.4 E2E 확장 (`e2e/actor.spec.ts`)
- 기존 테스트 보존 + 확장:
  - 6섹션 모두 렌더 확인
  - Reel 탭 클릭/키보드 전환
  - Reel episode 선택 → player skeleton 표시 (`videoUrl` 빈 상태)
  - character card flip (hover + 키보드)
  - reduced-motion 시뮬레이션 (`emulateMedia({ reducedMotion: 'reduce' })`)
  - 모바일 viewport (`devices['iPhone 13']`) → Reel 세로 stack 확인
  - 6 작품 정확성 assertion (캐릭터명·작품명 정정 검증)
  - `/dev` cross-link 부재 검증 (`a[href*="/dev"]` 0건)
  - 금지 작품(`사랑하거나 말거나`, `오르골` 등) 미노출 검증

---

## 6. Phase 6 — 데이터 인터뷰 (character card 카피 채우기)

[Priority: Medium] 시각·인터랙션이 안정된 이후 별도 사용자 인터뷰 round.

### 6.1 character note 카피 작성
- 5개 real card 각각 1~2줄 character note 인터뷰
  - 점원 (당신이 죽였다)
  - 국현 (그래도 사랑이었다)
  - 민혁 (요즘것들)
  - 대현 (어느날 엄마가 봉투를 썼다)
  - 집주인 (눈)
- 톤 가이드: 캐스팅 디렉터가 "이 배우의 해석 방향"을 30초에 이해할 수 있는 한 줄

### 6.2 hashtags 작성
- 각 카드 2~3개 hashtag (예: `#청춘성장`, `#일상감성`, `#노이르`)
- 단일 SPEC에 묶이지 않은 별도 인터뷰 round

### 6.3 placeholder 카드 메시지 확정
- 너만 있으면 (준혁) — "STILL COMING · 2026" 또는 동일 의미 카피

---

## 7. Phase 7 — 자산 입수 후 통합 (rolling)

[Priority: Low, rolling] SPEC 범위 외이지만 plan에 명시.

- 사용자가 reel 영상(11개) 편집 완료 시 → `data.ts`의 `videoUrl` 페이스트
- 사용자가 요즘것들 포스터 입수 시 → 민혁 카드 `coverImage` 페이스트 + `cardKind: "poster"` 활성
- 사용자가 그래도 사랑이었다 still 입수 시 → 국현 카드 `coverImage` 페이스트 + `cardKind: "low-quality-still"` 활성
- 마크업 변경 없이 데이터 페이스트만으로 활성 (REQ-ACT-O-001/002/003 contract)

---

## 8. 의존성 그래프

```
Phase 0 (사전 준비)
   ↓
Phase 1 (비주얼 시스템 + Hero shell) ─── (Hero shell은 page.tsx 첫 조립 트리거)
   ↓
Phase 2 (Profile + Filmography) ──── data.ts 재구조화 선행
   ↓
Phase 3 (Reel) ────── REEL 데이터 schema 필요
   ↓
Phase 4 (Roles: Timeline + Character Cards) ────── CHARACTER_CARDS / TIMELINE 데이터 필요
   ↓
Phase 5 (Polish: 전환·접근성·성능·E2E) ────── 모든 섹션 조립 후 게이트
   ↓
Phase 6 (데이터 인터뷰: character card 카피) ────── 비주얼 안정 후
   ↓
Phase 7 (자산 입수 통합) ────── rolling
```

병렬화 가능:
- Phase 2와 Phase 3은 data.ts 재구조화가 끝나면 독립 진행 가능
- Phase 4는 Phase 1/2 완료 후 독립 진행 가능
- Phase 5는 모든 섹션 완료 필요

---

## 9. 위험·완화 매트릭스

| 위험 | 발생 시 대응 |
|---|---|
| off-white 위 #b8a98a 콘트라스트 AA 미달 | hairline 액센트만 사용, 본문은 ink(#1a1a1a) 통일. 액센트는 작품 카테고리 라벨에만 한정 |
| 모바일 Safari `<video>` autoplay 차단 | muted + playsinline 필수, data-saver 환경 fallback (poster + 정적 frame) |
| character card flip의 hydration mismatch | SSR 출발 상태는 항상 front face. flip 상태는 사용자 인터랙션 후 useState만 |
| Cormorant Garamond 큰 한글 깨짐 | 한글은 절대 Cormorant에 매핑하지 않음. Pretendard 전용 |
| Lighthouse < 80 (Hero video 활성 시) | `preload="none"`, poster를 LCP element로, IntersectionObserver 진입 후 play |
| 자산 미입수 상태에서 페이지 빈 듯 보임 | placeholder UI(skeleton + grain)가 elegant하게 보이도록 톤 매칭 |
| 키보드 only 탐색에서 ReelPlayer 화살표 패턴 누락 | WAI-ARIA tabs 표준 패턴 정확히 구현, E2E로 회귀 방지 |
| 6개 작품 set이 임의로 변경됨 | `data.ts`에 `@MX:ANCHOR` 태그 + E2E assertion |

---

## 10. T-shirt sizing

| Phase | 사이즈 | 핵심 작업 |
|---|---|---|
| 0. 사전 준비 | S | 폰트 등록, 토큰 정의, 디렉터리 셋업 |
| 1. 비주얼 시스템 + Hero shell | **L** | off-white/carbon 통합, magazine grid, Hero placeholder/video 분기 |
| 2. Profile + Filmography | M | data.ts 재구조화, 12-col grid, 매거진 인덱스 타이포 |
| 3. Reel | **L** | ReelPlayer Client component, WAI-ARIA tabs, skeleton, 모바일 stack |
| 4. Roles | **L** | RoleTimeline + CharacterCard flip + reduced-motion fallback |
| 5. Polish | M | 전환·접근성·성능·E2E 확장 |
| 6. 데이터 인터뷰 | S | character note · hashtag 카피 (사용자 round) |
| 7. 자산 입수 | XS | rolling, 데이터 페이스트만 |

전체 노력: Phase 1 + 3 + 4 = 페이지의 70%. Phase 2 + 5 = 견고함. Phase 6 + 7 = 후속.

---

## 11. 구현 참조

- `app/dev/page.tsx` + `_components/` — Client leaf 분리·SSR-first 패턴, 토큰 모듈, hook 패턴 (`usePrefersReducedMotion`)
- `SPEC-DEV-REDESIGN-001/plan.md` — 비슷한 비주얼 시스템 + Client component 분리 phase 분해 (대칭 reference)
- 기존 `app/actor/page.tsx` — 보존 가능한 SSR-first 패턴 (전면 교체이나 골격 사고는 유지)
- WAI-ARIA tabs pattern — Reel 섹션 키보드 패턴 표준

---

## 12. Open Questions (구현 단계에서 결정)

1. **hero→profile 전환 정확한 방식** — 80px gradient bridge vs sharp cut(camera cut 느낌). 권장: gradient bridge. PoC 후 결정.
2. **Reel 카테고리 전환 시 episode 선택 동작** — (a) 첫 episode 자동 선택, (b) 카테고리별 마지막 선택 기억. 권장: (a) 단순함 우선.
3. **character card flip 트리거 모바일** — hover 미지원 모바일에서 tap = toggle. 첫 진입 시 hint 제공할지 (작은 "Tap to flip" 라벨) 결정.
4. **국현(그래도 사랑이었다) 카드 grayscale 처리 강도** — 자산 입수 후 시각 비교 라운드.
5. **profile.info 학력 노출 여부** — 캐스팅 시장 컨벤션 고려, 사용자 결정.
6. **gold(#b8a98a) 액센트 컬러 채택 범위** — 콘트라스트 측정 후 hairline 한정 vs 카테고리 라벨까지 확장.
7. **footer 카피라이트 갱신** — 기존 "© 2025 서해우. All rights reserved." → 2026 갱신 또는 유지.
