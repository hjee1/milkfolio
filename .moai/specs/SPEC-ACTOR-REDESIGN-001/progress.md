## SPEC-ACTOR-REDESIGN-001 Progress

- Started: 2026-05-21
- Status: **Run in progress — Phase 0+1+2+3 완료, Phase 4~5 pending**
- Harness level: standard
- Development methodology: **TDD with brownfield enhancement** (per quality.yaml `development_mode: tdd`; SPEC frontmatter의 DDD 표기는 informational — 실제 작업은 test-first 사이클로 진행)
- Execution mode: sub-agent (expert-frontend로 위임)
- Detected language skill: moai-lang-typescript

### HISTORY

- 2026-05-21 — v1.0.0 draft 작성. EARS U/E/S/O/N 30개.
- 2026-05-21 — v1.0.0 Amendment 1 — 7 patches 적용: bridge LOCK / Reel sessionStorage / gold 3 zone / persona prohibited-list / footer 2026 / chevron hint / asset lifecycle. EARS 5개 신규(U-009/U-010/U-011/U-012/E-007/O-005), N-004 강화, E-002/E-003 revision. 총 36개 EARS 클로즈.
- 2026-05-21 — **Run Phase 0+1 완료** — 폰트(Cormorant + Pretendard via CDN), 토큰 모듈, reduced-motion/reduced-data 훅, Hero.tsx(Server) + HeroReel.tsx(Client, placeholder 셸), page.module.css 전면 교체(off-white body + carbon hero + 12-col grid + 60~96px bridge), e2e/actor.spec.ts 확장(8/8 신규 hero 테스트 PASS, 2개 기존 테스트 skip with Phase 2 TODO). tsc 0 errors, pnpm build 성공.
- 2026-05-21 — **Run Phase 2 완료** — data.ts 전면 재구조화(PROFILE/HERO/REEL 3카테고리×11ep placeholder/TIMELINE 6entries/CHARACTER_CARDS 6cards/FILMOGRAPHY 6works/NAV_LINKS 5anchors, @MX:ANCHOR×2 + @MX:NOTE×2). Profile.tsx + Filmography.tsx (Server) + 각 module.css. LD2 토큰 swap: `accentGold` #b8a98a→#8b6f47 (off-white용), `accentGoldOnDark` #b8a98a 신설 (Hero carbon용). LD1 h1 ownership: Hero h1 유지, Profile h2 "Seo Haeu". page.tsx 옛 About/Filmography/Gallery 제거. **22/22 테스트 PASS** (12 신규 Phase 2 + 2 unskip 재작성 + 8 hero v2 preserve). tsc 0 errors, build 성공.
- 2026-05-21 — **Run Phase 3 완료** — Reel.tsx (Server, eyebrow "Reel" + h2 "데모 영상" + lead 한국어 1줄) + ReelPlayer.tsx (Client, WAI-ARIA tabs roving tabindex + Intro/Scene/Featured 3 카테고리 + sessionStorage `actor.reel.lastEpisode.{categoryId}` 복원·저장 + REQ-ACT-O-001 spread 패턴 video shell + skeleton overlay + reduced-data preload="none") + 각 module.css. page.tsx에 `<Reel />` 1줄 + 주석 Phase 3 체크리스트 갱신. @MX:ANCHOR×1 (ReelPlayer 인터랙션 진입점, fan_in: Reel.tsx + e2e + data.ts REEL = 3) + @MX:NOTE×3. **29/29 테스트 PASS** (Phase 1 hero 7 + Phase 2 profile/filmography 13 + 상단 smoke 2 + Phase 3 reel 7: B0/B1/B2/B3/B5/B6/B7). tsc 0 errors. evaluator-active weighted 0.832 PASS (Functionality 0.75, Security 1.00, Craft 0.75, Consistency 0.88).
- 2026-05-21 — **LD2 v2 token re-darken** — evaluator-active가 정량 검증으로 REQ-ACT-U-012 미달 발견(`#8b6f47` on `#f8f5f0` 실측 4.33:1 < AA 4.5:1, 0.17 부족 — Phase 2 LD2 token 결정 시 contrast 계산이 부정확했음). `accentGold` `#8b6f47` → `#7c6240` (실측 5.25:1, AA 통과 + 여유). 영향 범위: tokens.ts + page.module.css(--actor-accent-gold CSS var) + Hero/Profile/Reel/ReelPlayer/Filmography module.css + Profile.tsx/Reel.tsx 주석. SPEC REQ-ACT-U-012 조항 "≤ #8b6f47 darken"은 새 값(#7c6240)이 상한보다 더 어둡게 위치하므로 준수. 색상 교체 후 tsc 0 / 29/29 e2e PASS 재확인. `accentGoldOnDark: #b8a98a` (Hero carbon 위)는 ~10:1로 충분하여 변경 없음.

### Phase Status

| Phase | 설명 | 상태 |
|---|---|---|
| Phase 0 | 사전 준비 (폰트, 토큰, hook, 디렉터리 셋업) | **completed** (2026-05-21) |
| Phase 1 | 비주얼 시스템 + Hero shell | **completed** (2026-05-21) |
| Phase 2 | Profile + Filmography (서버 렌더) | **completed** (2026-05-21) |
| Phase 3 | REEL Client component | **completed** (2026-05-21) |
| Phase 4 | ROLES (Timeline + Character Cards) | pending |
| Phase 5 | Polish (전환·접근성·성능·E2E) | pending |
| Phase 6 | 데이터 인터뷰 (character card 카피) | pending (rolling) |
| Phase 7 | 자산 입수 후 통합 (rolling) | pending (rolling) |

### Phase 0+1 Deliverables

**Files created (7)**
- `app/actor/_components/shared/tokens.ts` — `@MX:ANCHOR` ACTOR_TOKENS
- `app/actor/_components/shared/usePrefersReducedMotion.ts` — `@MX:NOTE` REQ-ACT-S-001
- `app/actor/_components/shared/usePrefersReducedData.ts` — `@MX:NOTE` REQ-ACT-S-004/E-007
- `app/actor/_components/Hero.tsx` (Server) — `@MX:NOTE`
- `app/actor/_components/Hero.module.css`
- `app/actor/_components/HeroReel.tsx` (Client) — `@MX:ANCHOR` REQ-ACT-O-001/E-006
- `app/actor/_components/HeroReel.module.css`

**Files modified (5)**
- `app/actor/data.ts` — added `HERO` export (reelUrl/posterImage/lineupHint) + `@MX:NOTE`
- `app/actor/page.module.css` — 전면 교체 (off-white body, carbon hero, 12-col grid, 64~96px bridge)
- `app/actor/page.tsx` — `<Hero />` 통합 + `<div data-hero-bridge />` + Phase 2 TODO 마커
- `app/actor/layout.tsx` — title/description/OG 갱신, Pretendard `<link>` CDN 주입
- `e2e/actor.spec.ts` — `hero v2 (Phase 1)` describe 7개 신규 + 2개 기존 skip

**Test results**: 8/8 신규 + 1/1 기존(filmography) PASS, 2 skipped (Phase 2 TODO). tsc 0 errors, build OK.

**Deviation 노트**:
- 폰트: `next/font/google`은 Somansa 프록시에서 실패 → 기존 `globals.css @import` 패턴 + Pretendard CDN(jsdelivr) 사용. Phase 7에서 self-host woff2로 정리 권장.
- 기존 테스트 2개 skip: 옛 Hero의 `h1 = 서해우` 가정이 깨짐 → Phase 2에서 h1 ownership 결정 (Hero h1 유지 vs Profile h1로 이동).

**Phase 2 인계 사항**:
- h1 ownership: 현재 Hero `<h1>S E O   H A E U</h1>`. Profile 섹션에도 h1 두면 중복. Phase 2 결정 필요 (권장: Hero를 h1로 유지, Profile은 h2).
- Gold WCAG: 현재 Hero eyebrow는 carbon 위 #b8a98a (10:1, OK). Phase 2에서 off-white 위 적용 시 ~2.3:1 → REQ-ACT-U-012 darken (#8b6f47) 토큰 전환 필요.
- HeroReel의 `{...(hasReel ? { src } : {})}` 패턴은 ReelPlayer skeleton에 동일 적용 권장.
- 레거시 About/Filmography/Gallery/Contact는 데이터·마크업이 SPEC 위반 상태로 남아있음 — Phase 2에서 전면 교체.

### EARS coverage (Phase 3까지 누적)

| Req | 상태 |
|---|---|
| REQ-ACT-U-001 (6 sections) | partial — 4/6 도착 (Hero/Profile/Reel/Filmography) |
| REQ-ACT-U-002 (Korean + English exceptions) | **passed** (Phase 0~3) |
| REQ-ACT-U-003 (off-white body + carbon hero) | **passed** (Phase 1) |
| REQ-ACT-U-004 (Cormorant + Pretendard, drop Noto Serif KR for actor) | **passed** (Phase 0) |
| REQ-ACT-U-005 (Server Component parent + Client leaves) | **passed** (Phase 3: Reel Server + ReelPlayer Client) |
| REQ-ACT-U-006 (6 works only, §6 D5) | **passed** (Phase 2, Filmography H1) |
| REQ-ACT-U-007 (data-accent="actor" wrapper) | partial — `data-actor-body` 적용 (Phase 1) |
| REQ-ACT-U-008 (no /dev cross-link, body-only with nav exception) | **passed** (Phase 2, H3) |
| REQ-ACT-U-009 (Hero→Profile gradient bridge 60~100px LOCK) | **passed** (Phase 1) [Patch 1] |
| REQ-ACT-U-010 (footer 카피라이트 연도 `2026`) | **passed** (Phase 0, SiteFooter) [Patch 5] |
| REQ-ACT-U-011 (gold 3 zone: hairline + section label + role-type tag) | **passed** (Phase 2/3) [Patch 3] |
| REQ-ACT-U-012 (gold WCAG AA 미달 시 ≤ #8b6f47 darken 토큰 전역) | **passed** (LD2 v2 #7c6240, 실측 5.25:1) [Patch 3] |
| REQ-ACT-E-001 (Hero 100vh + 좌측 카피) | **passed** (Phase 1) |
| REQ-ACT-E-002 (Reel 탭 활성화 + sessionStorage 마지막 선택 복원) | **passed** (Phase 3, B6) [Patch 2] |
| REQ-ACT-E-003 (Reel episode 선택 + sessionStorage 저장) | **passed** (Phase 3, B6) [Patch 2] |
| REQ-ACT-E-004 (character card hover/tap flip) | not started (Phase 4) |
| REQ-ACT-E-005 (placeholder card 정적 카피) | not started (Phase 4) |
| REQ-ACT-E-006 (Hero reelUrl 분기) | **passed** (Phase 1) |
| REQ-ACT-E-007 (reduced-data Reel preload 차단) | **passed** (Phase 3, B7) [Patch 2] |
| REQ-ACT-S-001 (prefers-reduced-motion) | **passed** (Phase 1, Hero) |
| REQ-ACT-S-002 (모바일 Reel 세로 stack) | **passed** (Phase 3, mobile-first 1-col → 768px+ 7/5) |
| REQ-ACT-S-003 (키보드 only 탐색) | partial — Phase 3 ReelPlayer ArrowL/R+Home/End OK, Phase 4 cards 대기 |
| REQ-ACT-S-004 (prefers-reduced-data) | **passed** (Phase 3) |
| REQ-ACT-O-001 (reelUrl 빈 값 → fallback) | **passed** (Phase 1 Hero + Phase 3 ReelPlayer 동일 spread 패턴) |
| REQ-ACT-O-002 (Reel videoUrl 빈 값 → skeleton) | **passed** (Phase 3, B3) |
| REQ-ACT-O-003 (coverImage null → typographic placeholder) | not started (Phase 4) |
| REQ-ACT-O-004 (빈 카테고리 disabled) | **passed** (Phase 3 정적 가드) |
| REQ-ACT-O-005 (모바일 첫 세션 chevron hint) | not started (Phase 4) [Patch 6] |
| REQ-ACT-N-001 (no third-party video iframe) | **passed** (Phase 3, B5) |
| REQ-ACT-N-002 (no analytics + sessionStorage only) | **passed** (Phase 3, B6: localStorage.length=0) [Patch 2] |
| REQ-ACT-N-003 (no signup) | **passed** (마크업 없음) |
| REQ-ACT-N-004 (본문 prohibited substring 15개 + nav 예외) | **passed** (Phase 2 H3 + Phase 3 자동 커버) [Patch 4] |
| REQ-ACT-N-005 (no excluded works) | **passed** (Phase 2 H2) |
| REQ-ACT-N-006 (Lighthouse Performance ≥ 80) | not started (Phase 5) |
| REQ-ACT-N-007 (no layout shift during hydration) | partial — Phase 3 hydration mismatch 회피 OK, 정량 측정은 Phase 5 |
| REQ-ACT-N-008 (no emoji glyphs) | **passed** (Phase 2/3) |

### 다음 단계

1. 사용자 annotation cycle (1~6 iterations): SPEC 검수 + 카피 톤 1차 라운드
2. 사용자 승인 → `/clear` → `/moai run SPEC-ACTOR-REDESIGN-001`
3. Run phase: Phase 0 ~ 5 순차 진행
4. Phase 6 character note·hashtag 인터뷰 round 일정 합의
5. Phase 7 rolling: 영상·자산 입수 시점에 페이스트
