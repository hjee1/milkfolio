---
id: SPEC-ACTOR-REDESIGN-001
version: 1.0.0
status: draft
---

# SPEC-ACTOR-REDESIGN-001 (Compact) — /actor 풀파워 재설계

## Mission
`/actor`를 정적 다크 노이르 5섹션 → Editorial Magazine (VOGUE Korea) 6섹션으로 전면 재설계. 캐스팅 디렉터 30초 결정 윈도우 충족. KPI: "이 배우와 회의를 잡고 싶다".

## 6 Sections (locked)
Hero (carbon #0a0a0a, video shell + 좌측 카피) → Profile (off-white 매거진 grid + Cormorant H1) → Reel (Netflix detail page: Intro/Scene/Featured 탭 + 좌 player + 우 list) → Roles (horizontal timeline + 6 character cards with 3D flip) → Filmography (매거진 인덱스 타이포, 6작품) → Contact (`C A S T   I N Q U I R Y` editorial).

## Visual System
- Body: off-white #f8f5f0 + ink #1a1a1a, Cormorant Garamond (라틴) + Pretendard (국문). Noto Serif KR 제거(actor 범위).
- Hero only: carbon #0a0a0a + off-white text.
- Hero→Profile 수직 fade bridge ~80px.
- Accent: #b8a98a gold(콘트라스트 측정 후 hairline 한정), 미달 시 ink 통일.

## EARS Requirements (요약)

### Ubiquitous
- **U-001**: 6 sections (Hero/Profile/Reel/Roles/Filmography/Contact)
- **U-002**: 한국어 본문 + 영문 예외(헤드라인·Reel 라벨·이메일·`Seo Haeu`)
- **U-003**: body off-white + hero carbon
- **U-004**: Cormorant + Pretendard, Noto Serif KR 제거
- **U-005**: Server Component parent + Client leaves (HeroReel/ReelPlayer/CharacterCard)
- **U-006**: 정확히 6작품 (D5)
- **U-007**: `data-accent="actor"` wrapper 유지
- **U-008**: /dev cross-link 금지

### Event-Driven
- **E-001**: Hero 진입 시 100vh + 좌측 카피 (`서해우 / Seo Haeu — Actor since 2023` + 라인업 힌트)
- **E-002**: Reel 탭 클릭/키보드 활성화 → player + list 갱신, 포커스 유지
- **E-003**: Reel episode 클릭 → player 로드. videoUrl 빈 값 → skeleton
- **E-004**: character card hover(데스크톱) / tap(모바일) → 3D flip back face (스틸 mini-grid + note + hashtags)
- **E-005**: placeholder card는 flip 대신 typographic placeholder 유지
- **E-006**: `HERO.reelUrl` 빈 값 → 정적 portrait + grain + ken-burns. URL 채워짐 → `<video>` 활성

### State-Driven
- **S-001**: reduced-motion → 자동재생/ken-burns/flip transform 비활성, opacity fade로 대체
- **S-002**: <768px → Reel player 위 / list 아래 세로 stack
- **S-003**: 키보드 only → 모든 인터랙티브 요소 Tab 순회 + 포커스 링 dark/light 양쪽 명확
- **S-004**: prefers-reduced-data → hero video autoplay 비활성, poster만

### Optional
- **O-001**: reelUrl 빈 값 → `<video>` shell 예약, markup 변경 없이 URL 주입만으로 활성
- **O-002**: videoUrl 빈 값 → elegant skeleton ("영상 준비 중" + grain)
- **O-003**: coverImage === null → typographic front placeholder
- **O-004**: 빈 카테고리 → 탭 disabled + aria-disabled

### Unwanted
- **N-001**: third-party 영상 임베드(YouTube/Vimeo iframe) 금지, 자체 호스팅 `<video>`만
- **N-002**: third-party 분석 스크립트 신규 추가 금지
- **N-003**: 회원가입/구독/뉴스레터/예약 금지
- **N-004**: /dev cross-link 금지
- **N-005**: §6 D5 외 작품(사랑하거나 말거나, 단절, 삶, 오르골, 오르골들 등) 노출 금지
- **N-006**: Lighthouse Performance 모바일 < 80 금지
- **N-007**: hydration layout shift CLS 0.1+ 금지
- **N-008**: emoji 글리프 사용 금지 (✉/📷 제거)

## Data Model (data.ts 재구조화)

`PROFILE` / `HERO` (reelUrl 분기 contract) / `REEL` (3 카테고리: Intro 1ep, Scene 5ep, Featured 5ep) / `TIMELINE` (6작품, 연도 desc) / `CHARACTER_CARDS` (5 real + 1 placeholder, cardKind: still/poster/low-quality-still/placeholder) / `FILMOGRAPHY` (드라마/영화/뮤지컬 카테고리) / `NAV_LINKS` (6 sections).

## 6 Works (D5, locked)

| Year | Work | Role | Type | 자산 |
|------|------|------|------|-----|
| 2026 | 너만 있으면 | 준혁 | 단편 · 주연 | placeholder |
| 2025 | 당신이 죽였다 | 점원 | Netflix · 단역 | still_netflix_1/2 |
| 2025 | 그래도 사랑이었다 | 국현 | 단편 · 주연 | low-quality still (추후) |
| 2024 | 요즘것들 | 민혁 | 뮤지컬 · 주연 | 포스터 (추후) |
| 2023 | 어느날 엄마가 봉투를 썼다 | 대현 | 단편 · 주연 | still_bongtu_1/2/3 |
| 2023 | 눈 | 집주인 | 단편 · 주연 | still_nun_1/2 |

기존 data.ts 오류 정정: 점원(매장직원 아님), 대현(무명 아님), 집주인(무명 아님), 봉투 타입 단편·주연(혼합 표기 아님). 제거: 사랑하거나 말거나, 단절, 삶, 오르골, 오르골들.

## Acceptance (Given/When/Then 발췌)

- **A1**: hero carbon + body off-white + 전환 fade bridge 시각 확인
- **A2**: 6 섹션 DOM 존재
- **B1/B2**: Reel 탭 마우스/키보드 활성화, 좌우 화살표 패턴
- **B3**: 빈 videoUrl → skeleton, 페이지 깨짐 없음
- **B5**: third-party 영상 iframe 0건
- **C1/C2/C4**: character card hover/tap/키보드 flip
- **C3**: placeholder card flip 비활성
- **C5**: 카드 정확히 6장
- **D1/D3**: hero reelUrl 빈 값 → portrait + grain + ken-burns, 카피 항상 표시
- **E1/E2/E3**: reduced-motion / reduced-data 존중, 키보드 only 완전 탐색
- **E4**: Lighthouse Accessibility ≥ 95
- **F1/F3**: Lighthouse Performance ≥ 80, LCP element = hero poster
- **G1**: 모바일 320px 가로 스크롤 없음, character card 1-col
- **H1/H2**: 6작품만, 금지 작품 0건
- **H3**: /dev cross-link / Hyunwoo Jee / AI Technical Engineer 0건
- **H4**: emoji 0건
- **L1**: 사용자 "이 배우와 회의를 잡고 싶다" KPI 게이트

## Files to Modify

### Modify
- `app/actor/page.tsx` — 전면 재작성, Server parent + 6섹션 조합
- `app/actor/page.module.css` — 전면 교체 (off-white + carbon hero)
- `app/actor/data.ts` — 전면 재구조화 (PROFILE/HERO/REEL/TIMELINE/CHARACTER_CARDS/FILMOGRAPHY/NAV_LINKS)
- `app/actor/layout.tsx` — 메타 업데이트 (title/description/OG)
- `app/layout.tsx` 또는 `app/actor/layout.tsx` — Cormorant + Pretendard 폰트 등록
- `e2e/actor.spec.ts` — 회귀 확장

### New
- `app/actor/_components/Hero.tsx` + `Hero.module.css` (Server)
- `app/actor/_components/HeroReel.tsx` + `HeroReel.module.css` (Client)
- `app/actor/_components/Profile.tsx` + `Profile.module.css` (Server)
- `app/actor/_components/Reel.tsx` + `Reel.module.css` (Server)
- `app/actor/_components/ReelPlayer.tsx` + `ReelPlayer.module.css` (Client)
- `app/actor/_components/Roles.tsx` + `Roles.module.css` (Server)
- `app/actor/_components/RoleTimeline.tsx` + `RoleTimeline.module.css` (Server)
- `app/actor/_components/CharacterCard.tsx` + `CharacterCard.module.css` (Client)
- `app/actor/_components/Filmography.tsx` + `Filmography.module.css` (Server)
- `app/actor/_components/Contact.tsx` + `Contact.module.css` (Server)
- `app/actor/_components/shared/tokens.ts`
- `app/actor/_components/shared/usePrefersReducedMotion.ts`
- `app/actor/_components/shared/usePrefersReducedData.ts`

### Remove (자연 삭제)
- 기존 `app/actor/page.tsx`의 5섹션 마크업
- 기존 `GALLERY` const, `FilmographyItem.platform/typeTag/type` 옛 필드, ✉/📷 emoji
- 기존 작품 항목 중 §6 D5 외(사랑하거나 말거나, 단절, 삶, 오르골, 오르골들)

## Exclusions
1. 실제 reel 영상 제작·편집
2. third-party 영상 임베드(YouTube/Vimeo iframe)
3. CMS / Server Actions
4. `/actor` 서브 라우트
5. character card 카피(notes, hashtags) 작성 (별도 인터뷰 round)
6. AI 정체성 cross-link
7. 다른 페르소나 변경
8. 회원/구독/예약/뉴스레터
9. 다국어(i18n)
10. Three.js / WebGL / 3D
11. 영상 재생 자체 E2E
12. emoji 글리프

## Methodology
DDD (브라운필드). ANALYZE 기존 `app/actor/`자산·data → PRESERVE 가용 still 자산·`/actor` URL·페르소나 분리 → IMPROVE 6섹션 재작성 + data 정정.
