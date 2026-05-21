## SPEC-ACTOR-REDESIGN-001 Progress

- Started: 2026-05-21
- Status: draft (annotation cycle 전, Run phase 미진입)
- Harness level: standard
- Development methodology: DDD (per spec frontmatter; brownfield — 기존 `app/actor/` 자산·data 활용)
- Execution mode: sub-agent (Run phase 진입 시 expert-frontend 위임 예정)
- Detected language skill: moai-lang-typescript

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
| REQ-ACT-U-008 (no /dev cross-link) | not started |
| REQ-ACT-E-001 (Hero 100vh + 좌측 카피) | not started |
| REQ-ACT-E-002 (Reel 탭 클릭/키보드 활성화) | not started |
| REQ-ACT-E-003 (Reel episode 선택) | not started |
| REQ-ACT-E-004 (character card hover/tap flip) | not started |
| REQ-ACT-E-005 (placeholder card 정적 카피) | not started |
| REQ-ACT-E-006 (Hero reelUrl 분기) | not started |
| REQ-ACT-S-001 (prefers-reduced-motion) | not started |
| REQ-ACT-S-002 (모바일 Reel 세로 stack) | not started |
| REQ-ACT-S-003 (키보드 only 탐색) | not started |
| REQ-ACT-S-004 (prefers-reduced-data) | not started |
| REQ-ACT-O-001 (reelUrl 빈 값 → fallback) | not started |
| REQ-ACT-O-002 (Reel videoUrl 빈 값 → skeleton) | not started |
| REQ-ACT-O-003 (coverImage null → typographic placeholder) | not started |
| REQ-ACT-O-004 (빈 카테고리 disabled) | not started |
| REQ-ACT-N-001 (no third-party video iframe) | not started |
| REQ-ACT-N-002 (no analytics) | not started |
| REQ-ACT-N-003 (no signup) | not started |
| REQ-ACT-N-004 (no /dev cross-link) | not started |
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
