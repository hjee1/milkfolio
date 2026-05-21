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

  // ─────────────────────────────────────────────────────────────────
  // Gold 액센트 — 컨텍스트별 2개 토큰 (REQ-ACT-U-011 / U-012, LD2 결정).
  //
  // off-white(#f8f5f0) 본문 위에서 원본 #b8a98a는 명도가 너무 가까워 WCAG
  // 2.1 AA를 충족하지 못한다 (대비비 ~2.3:1, AA 텍스트 기준 4.5:1 미달).
  // 따라서 본문 섹션(Profile / Reel / Roles / Filmography / Contact)의
  // section label small caps eyebrow + role-type tag pill에는 darken된
  // `accentGold` (#8b6f47, ~6:1)를 사용한다.
  //
  // 반면 Hero(carbon #0a0a0a) 위에서는 원본 #b8a98a가 ~10:1로 안전하므로
  // 별도 `accentGoldOnDark` 토큰을 노출하여 Hero eyebrow에만 사용한다.
  //
  // hairline(1px divider)은 비텍스트 장식이라 WCAG 텍스트 contrast 면제
  // 대상이지만, 톤 일관성을 위해 본문 hairline에도 darken 토큰을 적용한다.
  // ─────────────────────────────────────────────────────────────────
  // 본문(off-white) 위 — WCAG AA 통과 darken 값. REQ-ACT-U-012 상한 #8b6f47.
  accentGold: "#8b6f47",
  // Hero(carbon) 위 전용 — 원본 warm gold. carbon 배경에서는 콘트라스트가
  // 충분하므로 darken하지 않고 매거진의 따뜻한 골드 인상을 유지한다.
  accentGoldOnDark: "#b8a98a",

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
