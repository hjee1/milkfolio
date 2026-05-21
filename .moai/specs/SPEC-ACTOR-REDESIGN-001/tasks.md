## Task Decomposition

SPEC: SPEC-ACTOR-REDESIGN-001
Generated: 2026-05-21 (Phase 1.5 — skeleton; expert-frontend will sub-decompose)

작업 단위는 phase별 묶음으로 거칠게 잡았다. 실제 Run phase 진입 시 expert-frontend가 Turn 단위로 세분화한다. 시간 추정은 사용하지 않고 priority + 의존 순서로 정렬.

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| T-001 | 폰트 등록: Cormorant Garamond + Pretendard via `next/font` | REQ-ACT-U-004 | - | app/actor/layout.tsx 또는 app/layout.tsx | pending |
| T-002 | actor 토큰 정의 (`_components/shared/tokens.ts`) — 색상/폰트/간격 | REQ-ACT-U-003, REQ-ACT-U-004 | T-001 | app/actor/_components/shared/tokens.ts | pending |
| T-003 | off-white 위 #b8a98a contrast 측정 → hairline 한정 결정 | REQ-ACT-N-006(부분), 위험 1 | T-002 | (측정 결과 → 토큰 보강) | pending |
| T-004 | shared/usePrefersReducedMotion hook (`/dev`에서 차용 또는 재구현) | REQ-ACT-S-001 | T-002 | app/actor/_components/shared/usePrefersReducedMotion.ts | pending |
| T-005 | shared/usePrefersReducedData hook | REQ-ACT-S-004 | T-002 | app/actor/_components/shared/usePrefersReducedData.ts | pending |
| T-006 | data.ts 전면 재구조화 — PROFILE/HERO/REEL/TIMELINE/CHARACTER_CARDS/FILMOGRAPHY/NAV_LINKS | REQ-ACT-U-006, REQ-ACT-N-005, §5 schema | - | app/actor/data.ts | pending |
| T-007 | 6 작품 set MX:ANCHOR 부착 + 금지 작품 제거 검증 | REQ-ACT-U-006, REQ-ACT-N-005 | T-006 | app/actor/data.ts | pending |
| T-008 | page.module.css 전면 교체 — magazine 12-col grid + carbon hero + off-white body | REQ-ACT-U-003, REQ-ACT-U-004 | T-002 | app/actor/page.module.css | pending |
| T-009 | layout.tsx 메타 업데이트 (title, description, OG) | REQ-ACT-U-002 | T-008 | app/actor/layout.tsx | pending |
| T-010 | Hero.tsx (Server) shell + 좌측 하단 카피 오버레이 + scroll cue | REQ-ACT-E-001 | T-008 | app/actor/_components/Hero.tsx, Hero.module.css | pending |
| T-011 | HeroReel.tsx (Client) — `<video>` 요소 + reelUrl 분기 + portrait fallback + grain + ken-burns | REQ-ACT-E-006, REQ-ACT-O-001, REQ-ACT-S-001, REQ-ACT-S-004 | T-004, T-005, T-006 | app/actor/_components/HeroReel.tsx, HeroReel.module.css | pending |
| T-012 | Hero MX:WARN 태그 부착 (SSR/CSR 분기) | (MX 계획) | T-011 | (in HeroReel.tsx) | pending |
| T-013 | Profile.tsx (Server) — 12-col grid, Cormorant H1 + 한국어 부제 + table | REQ-ACT-U-004, REQ-ACT-E-001(partial) | T-006, T-008 | app/actor/_components/Profile.tsx, Profile.module.css | pending |
| T-014 | Hero→Profile 80px vertical fade bridge | REQ-ACT-U-003 | T-010, T-013 | app/actor/page.module.css 또는 wrapper | pending |
| T-015 | Filmography.tsx (Server) — 카테고리 그룹 매거진 인덱스 타이포 | REQ-ACT-U-006 | T-006, T-008 | app/actor/_components/Filmography.tsx, Filmography.module.css | pending |
| T-016 | page.tsx 1차 조립 (Hero + Profile + Filmography) — 비주얼 톤 검증 | REQ-ACT-U-001, REQ-ACT-U-005 | T-010..T-015 | app/actor/page.tsx | pending |
| T-017 | Reel.tsx (Server) — 데이터 전달 + 섹션 헤더 | REQ-ACT-U-001 | T-006, T-008 | app/actor/_components/Reel.tsx, Reel.module.css | pending |
| T-018 | ReelPlayer.tsx (Client) — WAI-ARIA tabs + state + video swap | REQ-ACT-E-002, REQ-ACT-E-003, REQ-ACT-S-002, REQ-ACT-S-003 | T-017 | app/actor/_components/ReelPlayer.tsx, ReelPlayer.module.css | pending |
| T-019 | Reel skeleton ("영상 준비 중" + grain) — 빈 videoUrl 처리 | REQ-ACT-O-002 | T-018 | (in ReelPlayer.tsx) | pending |
| T-020 | Reel 모바일 stack CSS | REQ-ACT-S-002 | T-018 | ReelPlayer.module.css | pending |
| T-021 | ReelPlayer MX:ANCHOR 태그 부착 (외부 인터랙션 진입점) | (MX 계획) | T-018 | (in ReelPlayer.tsx) | pending |
| T-022 | page.tsx 2차 조립 (Reel 추가) | REQ-ACT-U-001 | T-016, T-018 | app/actor/page.tsx | pending |
| T-023 | RoleTimeline.tsx (Server SSR) — horizontal 6 작품 timeline | REQ-ACT-U-001, REQ-ACT-U-006 | T-006, T-008 | app/actor/_components/RoleTimeline.tsx, RoleTimeline.module.css | pending |
| T-024 | CharacterCard.tsx (Client) — 3D flip + 4종 cardKind 분기 | REQ-ACT-E-004, REQ-ACT-E-005, REQ-ACT-S-001, REQ-ACT-O-003 | T-004, T-006 | app/actor/_components/CharacterCard.tsx, CharacterCard.module.css | pending |
| T-025 | CharacterCard 키보드 패턴 (button + Enter/Space toggle) | REQ-ACT-S-003 | T-024 | (in CharacterCard.tsx) | pending |
| T-026 | CharacterCard reduced-motion fallback (opacity fade) | REQ-ACT-S-001 | T-024 | (in CharacterCard.tsx) | pending |
| T-027 | CharacterCard MX:WARN 태그 부착 (hover/tap + reduced-motion 분기) | (MX 계획) | T-024 | (in CharacterCard.tsx) | pending |
| T-028 | Roles.tsx (Server) — RoleTimeline + CharacterCard grid 조합 (3/2/1 col) | REQ-ACT-U-001 | T-023, T-024 | app/actor/_components/Roles.tsx, Roles.module.css | pending |
| T-029 | page.tsx 3차 조립 (Roles 추가) | REQ-ACT-U-001 | T-022, T-028 | app/actor/page.tsx | pending |
| T-030 | Contact.tsx (Server) — `C A S T   I N Q U I R Y` 헤드라인 + 이메일/인스타 + emoji 제거 | REQ-ACT-U-001, REQ-ACT-N-008 | T-008 | app/actor/_components/Contact.tsx, Contact.module.css | pending |
| T-031 | page.tsx 최종 조립 (6섹션 모두) + 기존 markup 제거 | REQ-ACT-U-001, REQ-ACT-U-005 | T-029, T-030 | app/actor/page.tsx | pending |
| T-032 | 키보드 only 탐색 검증 + 포커스 링 dark/light 양쪽 검증 | REQ-ACT-S-003 | T-031 | (수동 + e2e) | pending |
| T-033 | axe-core / Lighthouse Accessibility >= 95 검증 | REQ-ACT-N-006, E4 | T-031 | (수동 + Lighthouse CI) | pending |
| T-034 | e2e/actor.spec.ts 확장 — 6섹션, Reel 탭, CharacterCard flip, reduced-motion, 모바일, 6작품 정확성, 금지 작품 부재 | A1, A2, A3, B1, B2, B3, B4, B5, C1, C2, C3, C4, C5, D1, D3, E1, E3, G1, H1, H2, H3, H4 | T-031 | e2e/actor.spec.ts | pending |
| T-035 | Lighthouse 모바일 Performance >= 80, LCP < 2.5s, CLS < 0.1 검증 | REQ-ACT-N-006, F1, F3 | T-031, T-034 | (manual + Vercel preview) | pending |
| T-036 | bundle analyzer로 Client leaf 합산 측정 | F2 | T-031 | (manual) | pending |
| T-037 | TRUST 5 quality gate + MX tag final scan | (Phase 2.5 / 2.9) | T-032..T-036 | - | pending |
| T-038 | PR 생성 + Vercel 미리보기 + 사용자 KPI 게이트(L1) | L1 | T-037 | - | pending |
| T-039 | character card 카피 인터뷰 round (별도 Phase 6) | (process) | T-031 | app/actor/data.ts (note/hashtags 채움) | pending (Phase 6) |
| T-040 | reel `videoUrl` 페이스트 round (rolling, Phase 7) | REQ-ACT-O-001/002 | T-031 | app/actor/data.ts (videoUrl 채움) | pending (Phase 7, rolling) |
| T-041 | 자산 입수 후 character card cover 페이스트 (요즘것들 포스터, 그래도 사랑이었다 still) | REQ-ACT-O-003 | T-031 | app/actor/data.ts (coverImage 채움) | pending (Phase 7, rolling) |

### Turn mapping (planned, expert-frontend 재량으로 변동)

- **Turn 1** (Phase 0 + Phase 1 골격): T-001 ~ T-005 (폰트·토큰·hook), T-008 (CSS 골격), T-009 (메타)
- **Turn 2** (Phase 1 Hero): T-010 ~ T-012 (Hero + HeroReel)
- **Turn 3** (Phase 2 Profile/Filmography): T-006, T-007, T-013, T-014, T-015, T-016 (data + Profile + Filmography + 1차 조립)
- **Turn 4** (Phase 3 Reel): T-017 ~ T-022
- **Turn 5** (Phase 4 Roles): T-023 ~ T-029
- **Turn 6** (Phase 5 Contact + 최종 조립 + Polish): T-030 ~ T-038
- **Turn 7+** (Phase 6/7, rolling): T-039 ~ T-041

### Out of Run-phase scope (별도 처리)

- T-039 (character note·hashtag 인터뷰): 사용자 round 필요, Run phase 외
- T-040, T-041 (자산·영상 입수): 사용자 작업 의존, rolling
