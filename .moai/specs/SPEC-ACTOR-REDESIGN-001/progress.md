## SPEC-ACTOR-REDESIGN-001 Progress

- Started: 2026-05-21
- Status: draft (annotation cycle 진행 중 — Amendment 1 적용 후, Run phase 미진입)
- Harness level: standard
- Development methodology: DDD (per spec frontmatter; brownfield — 기존 `app/actor/` 자산·data 활용)
- Execution mode: sub-agent (Run phase 진입 시 expert-frontend 위임 예정)
- Detected language skill: moai-lang-typescript

### HISTORY

- 2026-05-21 — v1.0.0 draft 작성. EARS U/E/S/O/N 30개.
- 2026-05-21 — v1.0.0 Amendment 1 — 7 patches 적용: bridge LOCK / Reel sessionStorage / gold 3 zone / persona prohibited-list / footer 2026 / chevron hint / asset lifecycle. EARS 5개 신규(U-009/U-010/U-011/U-012/E-007/O-005), N-004 강화, E-002/E-003 revision. 총 36개 EARS 클로즈.

### Phase Status

| Phase | 설명 | 상태 |
|---|---|---|
| Phase 0 | 사전 준비 (폰트, 토큰, hook, 디렉터리 셋업) | pending |
| Phase 1 | 비주얼 시스템 + Hero shell | pending |
| Phase 2 | Profile + Filmography (서버 렌더) | pending |
| Phase 3 | REEL Client component | pending |
| Phase 4 | ROLES (Timeline + Character Cards) | pending |
| Phase 5 | Polish (전환·접근성·성능·E2E) | pending |
| Phase 6 | 데이터 인터뷰 (character card 카피) | pending (rolling) |
| Phase 7 | 자산 입수 후 통합 (rolling) | pending (rolling) |

### EARS coverage (현재 시점 — 작성만 됨)

| Req | 상태 |
|---|---|
| REQ-ACT-U-001 (6 sections) | not started |
| REQ-ACT-U-002 (Korean + English exceptions) | not started |
| REQ-ACT-U-003 (off-white body + carbon hero) | not started |
| REQ-ACT-U-004 (Cormorant + Pretendard, drop Noto Serif KR for actor) | not started |
| REQ-ACT-U-005 (Server Component parent + Client leaves) | not started |
| REQ-ACT-U-006 (6 works only, §6 D5) | not started |
| REQ-ACT-U-007 (data-accent="actor" wrapper) | not started |
| REQ-ACT-U-008 (no /dev cross-link, body-only with nav exception) | not started |
| REQ-ACT-U-009 (Hero→Profile gradient bridge 60~100px LOCK) | not started [Patch 1] |
| REQ-ACT-U-010 (footer 카피라이트 연도 `2026`) | not started [Patch 5] |
| REQ-ACT-U-011 (gold 3 zone: hairline + section label + role-type tag) | not started [Patch 3] |
| REQ-ACT-U-012 (gold WCAG AA 미달 시 ≤ #8b6f47 darken 토큰 전역) | not started [Patch 3] |
| REQ-ACT-E-001 (Hero 100vh + 좌측 카피) | not started |
| REQ-ACT-E-002 (Reel 탭 활성화 + sessionStorage 마지막 선택 복원) | not started [Patch 2] |
| REQ-ACT-E-003 (Reel episode 선택 + sessionStorage 저장) | not started [Patch 2] |
| REQ-ACT-E-004 (character card hover/tap flip) | not started |
| REQ-ACT-E-005 (placeholder card 정적 카피) | not started |
| REQ-ACT-E-006 (Hero reelUrl 분기) | not started |
| REQ-ACT-E-007 (reduced-data Reel preload 차단) | not started [Patch 2] |
| REQ-ACT-S-001 (prefers-reduced-motion) | not started |
| REQ-ACT-S-002 (모바일 Reel 세로 stack) | not started |
| REQ-ACT-S-003 (키보드 only 탐색) | not started |
| REQ-ACT-S-004 (prefers-reduced-data) | not started |
| REQ-ACT-O-001 (reelUrl 빈 값 → fallback) | not started |
| REQ-ACT-O-002 (Reel videoUrl 빈 값 → skeleton) | not started |
| REQ-ACT-O-003 (coverImage null → typographic placeholder) | not started |
| REQ-ACT-O-004 (빈 카테고리 disabled) | not started |
| REQ-ACT-O-005 (모바일 첫 세션 chevron hint) | not started [Patch 6] |
| REQ-ACT-N-001 (no third-party video iframe) | not started |
| REQ-ACT-N-002 (no analytics + sessionStorage only) | not started [Patch 2] |
| REQ-ACT-N-003 (no signup) | not started |
| REQ-ACT-N-004 (본문 prohibited substring 15개 + nav 예외) | not started [Patch 4] |
| REQ-ACT-N-005 (no excluded works) | not started |
| REQ-ACT-N-006 (Lighthouse Performance ≥ 80) | not started |
| REQ-ACT-N-007 (no layout shift during hydration) | not started |
| REQ-ACT-N-008 (no emoji glyphs) | not started |

### 다음 단계

1. 사용자 annotation cycle (1~6 iterations): SPEC 검수 + 카피 톤 1차 라운드
2. 사용자 승인 → `/clear` → `/moai run SPEC-ACTOR-REDESIGN-001`
3. Run phase: Phase 0 ~ 5 순차 진행
4. Phase 6 character note·hashtag 인터뷰 round 일정 합의
5. Phase 7 rolling: 영상·자산 입수 시점에 페이스트
