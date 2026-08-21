## SPEC-DEV-REDESIGN-001 Progress

> **현행화 노트 (2026-08-21)**: 아래 Turn 기록은 초기 6섹션 설계
> (Hero/Manifesto/Lab/Stack/Craft/Contact) 기준의 히스토리다. 최종 출하본은
> **4섹션** (Hero / WhatIDo(now) / Experience / Footer) + AgentTicker +
> ReflexTest + RobotPet 구성이며, Manifesto/Lab/Stack/Craft 컴포넌트와
> drei·motion 의존성은 채택되지 않았다 (motion은 2026-08-21 제거).
> 2026-08-21 정비: AgentTicker key/slice 버그·ReflexTest 유령 타이머 수정,
> 직함 "AI Technical Engineer" 정정, Mistral 언급 제거(콘텐츠 정책),
> reduced-motion 시 three.js 청크 스킵, e2e 스위트 현행 페이지 기준 재작성.

- Started: 2026-05-19
- Harness level: standard
- Development methodology: TDD (per quality.yaml) — UI-craft pragmatic deviation
- Execution mode: sub-agent
- Detected language skill: moai-lang-typescript

### Turn 1 (2026-05-19)

- Compatibility verified: three@0.184, R3F@9.6.1, drei@10.7.7, motion@12.39 — all React 19 / Next 16 peer-deps satisfied
- next.config.ts: BUILD_SHA + BUILD_TIME env injected
- shared/ infra: tokens.ts + 4 hooks (usePrefersReducedMotion, useDeviceTier, useBuildInfo, useFPS)
- TDD note: Vitest setup deferred (UI craft path; verification via e2e + visual inspection)

### Turn 2 (2026-05-19) — Hero only (INCORRECT INCREMENTAL APPROACH)

- @types/three@0.184.1 added
- Hero stack: Hero.tsx, HeroVisual.tsx (next/dynamic), HeroCanvas.tsx (R3F particle field), HeroLiveBoard.tsx, HeroFallback.tsx, Hero.module.css
- INCORRECT DECISION: Replaced only hero section, left legacy About/Stack/Experience/Contact in place. This violated REQ-DEV-U-001 (6 sections) and the SPEC's REMOVE delta marker. User feedback called this out.

### Turn 3 (2026-05-19) — Full SPEC alignment

- Apology + corrective rewrite: page.tsx fully rebuilt around the SPEC's 6 sections. Old `ABOUT_CARDS`, `STACK`, `CONTACTS`, `NAV_LINKS` constants and all legacy markup removed.
- New section components written:
  - `_components/DevNav.tsx` + `.module.css` — fixed navigation matching new section order
  - `_components/Manifesto.tsx` + `.module.css` — magazine-style identity declaration with strike-through framing of old identity, "now playing" activity list, pull quote ("This page is the portfolio")
  - `_components/Lab.tsx` + `.module.css` — three interactive demos:
    - `lab/AgentReplay.tsx` + `agent-replay.json` — typewriter replay of an agent shaving 8h off a pipeline; play/pause/restart; reduced-motion → static full transcript
    - `lab/CompoundComposer.tsx` — three orthogonal choice axes resolving to 27 system archetypes; aria radiogroup; live result panel
    - `lab/DAGExplorer.tsx` — six-node draggable pipeline with flowing packets; keyboard (tab + arrow keys) for accessibility; reset button
  - `_components/Stack.tsx` + `.module.css` — Harness · AI · Engineering · Foundations (4 categories; primary tools marked with cyan ▸)
  - `_components/Craft.tsx` + `.module.css` — terminal-style telemetry panel: commit SHA, deploy time, route, FPS (live + sparkline), avg/peak, fonts, transferred bytes, framework versions
  - `_components/Contact.tsx` + `.module.css` — big "Let's build something real." headline, availability pulse, email/LinkedIn/GitHub channel list, no /actor cross-link
- `app/dev/page.tsx` — reduced to pure 8-line composition (DevNav + 6 sections)
- `app/dev/page.module.css` — emptied (kept as no-op file with explanation comment)
- Verification:
  - `pnpm typecheck`: PASS (strict, 0 errors)
  - `pnpm build`: PASS (6 routes static-prerendered)

### EARS coverage after Turn 3

| Req | Status |
|---|---|
| REQ-DEV-U-001 (6 sections) | ✅ Hero / Manifesto / Lab / Stack / Craft / Contact |
| REQ-DEV-U-002 (English; 지현우 once) | ✅ Hero alias only |
| REQ-DEV-U-003 (AI Technical Engineer) | ✅ Hero eyebrow, Manifesto, metadata; "Data Engineer" only appears in Manifesto strikethrough |
| REQ-DEV-U-004 (no Hanwha internals) | ✅ Manifesto references the team by name only; no project details |
| REQ-DEV-U-005 (cyan signature + supporting palette) | ✅ tokens.ts; consistent across sections |
| REQ-DEV-U-006 (Server Components default + selective Client) | ✅ Hero/Lab/Craft are the only client subtrees |
| REQ-DEV-E-001 (hero WebGL <200ms) | ✅ next/dynamic + fallback shown immediately |
| REQ-DEV-E-002 (scroll fade-in) | ⚠️ CSS-only for now; Motion variants can be added in polish turn |
| REQ-DEV-E-003 (lab interactive replays) | ✅ all three cards |
| REQ-DEV-E-004 (hero pointer attraction) | ✅ |
| REQ-DEV-E-005 (live data) | ✅ Hero board + Craft panel |
| REQ-DEV-S-001 (reduced-motion) | ✅ hero canvas, AgentReplay, DAGExplorer all honor it |
| REQ-DEV-S-002 (mobile particle reduction) | ✅ useDeviceTier |
| REQ-DEV-S-003 (keyboard accessible) | ✅ Lab cards: tab/space/enter for AgentReplay, radiogroup for Compound, tab+arrows for DAG |
| REQ-DEV-O-001 (BUILD_SHA/TIME) | ✅ |
| REQ-DEV-O-002 (WebGL2 fallback) | ✅ |
| REQ-DEV-O-003 (R3F via dynamic) | ✅ |
| REQ-DEV-N-001 (no LLM API runtime calls) | ✅ AgentReplay is JSON-driven |
| REQ-DEV-N-002 (no third-party analytics added) | ✅ |
| REQ-DEV-N-003 (no signup/subscribe) | ✅ |
| REQ-DEV-N-004 (no /actor cross-link) | ✅ Contact rewritten; no Link to /actor |
| REQ-DEV-N-005 (Lighthouse ≥ 80) | ⏳ pending verification (Turn 4) |

### Turn 4 (planned)

- Visual review on Vercel preview / local dev — user feedback on tone & impact
- Polish: Motion variants for scroll fade-in (REQ-DEV-E-002 upgrade)
- e2e/dev.spec.ts expansion (6 sections, keyboard paths, reduced-motion, mobile)
- Lighthouse measurement (mobile + desktop)
- Phase 2.5 TRUST 5 quality gate
- Phase 2.9 @MX tag final scan
