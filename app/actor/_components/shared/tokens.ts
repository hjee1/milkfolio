// /actor 풀파워 재설계의 디자인 토큰 — Editorial Magazine 비주얼 시스템의
// 단일 진실 공급원(single source of truth). 모든 actor 섹션 컴포넌트는 이
// 모듈에서 색·폰트·그리드 값을 가져와야 하며, 컴포넌트 내부에 색·폰트를
// 하드코딩하지 않는다.
//
// @MX:ANCHOR: [AUTO] /actor 비주얼 시스템 contract (SPEC-ACTOR-REDESIGN-001
//             REQ-ACT-U-003 / U-004 / U-011 / U-012). 이 토큰 모듈이 Hero,
//             Profile, Reel, Roles, Filmography, Contact 6개 섹션 모두에서
//             import되므로 fan_in이 충분히 높다.
// @MX:REASON: 토큰을 바꾸면 페이지 전체 톤이 일관되게 바뀌어야 한다. 컴포넌트
//             내 하드코딩이 들어오면 일관성이 깨지고 WCAG/브랜드 검증 회귀가
//             감지되지 않는다.
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001

export const ACTOR_TOKENS = {
  // 배경 — 본문은 off-white, Hero만 carbon. REQ-ACT-U-003.
  bg: {
    body: "#f8f5f0", // off-white (REQ-ACT-U-003)
    hero: "#0a0a0a", // carbon (REQ-ACT-U-003)
  },

  // 잉크 (텍스트)
  ink: {
    primary: "#1a1a1a", // off-white 위 본문 텍스트
    soft: "#4a4a4a", // 약한 본문 (부제, 메타)
    inverse: "#f8f5f0", // Hero(carbon) 위 텍스트
  },

  // hairline divider (off-white 위 1px 가는 선)
  rule: "#d4ccbe",

  // gold 액센트 — 3 zone에만 사용 (hairline / section label / role-type tag).
  // REQ-ACT-U-011. 본문/캐릭터명/작품명/연도/큰 헤드라인/nav 링크에는 사용
  // 금지. WCAG AA 미달 시 darken 토큰(≤ #8b6f47, REQ-ACT-U-012)으로 전역 조정.
  accentGold: "#b8a98a",
  accentGoldDarken: "#8b6f47", // WCAG fallback (REQ-ACT-U-012)

  // 폰트 — Cormorant Garamond (라틴 serif 디스플레이) + Pretendard (국문 sans
  // 본문/UI). Noto Serif KR은 /actor 범위에서 사용하지 않는다 (REQ-ACT-U-004).
  // CSS 변수는 app/layout.tsx의 <head>에서 inline style + <link>로 등록된다.
  fonts: {
    display: "var(--font-cormorant)",
    body: "var(--font-pretendard)",
  },

  // 매거진 12-col grid 시스템
  grid: {
    maxWidth: "1320px",
    gutter: "2rem",
    columns: 12,
  },
} as const;

export type ActorTokens = typeof ACTOR_TOKENS;
