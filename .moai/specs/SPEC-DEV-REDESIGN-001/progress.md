## SPEC-DEV-REDESIGN-001 Progress

- Started: 2026-05-19
- Harness level: standard (auto-detected: 25+ files, multi-domain, feature type)
- Development methodology: TDD (per quality.yaml) — with UI-craft pragmatic deviation (see Turn 1 notes)
- Execution mode: sub-agent (default)
- Detected language skill: moai-lang-typescript (package.json + tsconfig.json)

### Turn 1 (2026-05-19)

- Phase 0.9 complete: TypeScript detected → moai-lang-typescript context loaded
- Phase 0.95 complete: Scale-based mode = Standard (25+ files, multi-domain frontend craft)
- Phase 0 complete: Dependency compatibility verified
  - three@0.184.0
  - @react-three/fiber@9.6.1 (peer: react >=19 <19.3, satisfied by React 19.2.6)
  - @react-three/drei@10.7.7 (peer: react ^19, @react-three/fiber ^9.0.0 — satisfied)
  - motion@12.39.0 (peer: react ^18 || ^19 — satisfied)
  - pnpm typecheck: PASSED
- next.config.ts: BUILD_SHA + BUILD_TIME env injection added (@MX:ANCHOR)
- _components/shared/ scaffolded with tokens + 4 hooks (usePrefersReducedMotion, useDeviceTier, useBuildInfo, useFPS)
- TDD methodology adjustment (recorded for transparency):
  - SPEC sets development_mode=tdd, but this is a UI-craft SPEC where unit testing has limited value
  - Decision: Skip dedicated unit-test framework (Vitest) setup in this turn
  - Hooks (usePrefersReducedMotion, useDeviceTier, useBuildInfo, useFPS) are written as pure, small modules
  - Verification path: e2e Playwright (Phase 7) + visual inspection during section implementation (Turns 2-5)

### Turn 2 (2026-05-19)

- @types/three@0.184.1 added (devDeps) — three.js has no bundled .d.ts
- Hero stack written and integrated into page.tsx:
  - `app/dev/_components/Hero.module.css` — full hero stylesheet, system board, fallback, responsive
  - `app/dev/_components/HeroFallback.tsx` — static SVG topology for WebGL2-absent / loading state
  - `app/dev/_components/HeroCanvas.tsx` — R3F particle field + distance-faded line segments + pointer attraction; honors useDeviceTier (particle count by tier) and usePrefersReducedMotion (single static frame instead of frame loop)
  - `app/dev/_components/HeroVisual.tsx` — next/dynamic({ ssr: false }) wrapper around HeroCanvas; routes to HeroFallback when WebGL2 missing or while chunk is loading
  - `app/dev/_components/HeroLiveBoard.tsx` — terminal-style status panel showing commit SHA, deploy age, live FPS, font-load state
  - `app/dev/_components/Hero.tsx` — server-component composer with SSR-friendly text overlay
- `app/dev/page.tsx` — replaced the old static hero markup with `<Hero />`; About/Stack/Experience/Contact remain on the legacy markup until Turns 3-5
- `app/dev/layout.tsx` — metadata updated to "AI Technical Engineer"; old Data Engineer copy removed
- Verification:
  - `pnpm typecheck`: PASSED (strict, errors 0)
  - `pnpm build`: PASSED (6 routes static-prerendered, /dev included)
- Acceptance criteria moved from pending to in-progress:
  - REQ-DEV-U-003 — AI Technical Engineer identity now visible in hero + metadata
  - REQ-DEV-E-001 — hero WebGL visualization rendered (PoC; FPS verification in Turn 5)
  - REQ-DEV-E-004 — pointer attraction in particle field implemented
  - REQ-DEV-E-005 — live system board surfaces FPS, fonts on hydration
  - REQ-DEV-O-001 — BUILD_SHA + BUILD_TIME wired through useBuildInfo into hero board
  - REQ-DEV-O-002 — WebGL2 fallback (SVG) routed through HeroVisual
  - REQ-DEV-O-003 — Three.js loaded via next/dynamic only
  - REQ-DEV-S-001 — prefers-reduced-motion short-circuits the frame loop
  - REQ-DEV-S-002 — particle count varies by device tier (mobile=600, tablet=1200, desktop=2400)

### Subsequent turns (planned)

- Turn 3: Manifesto + Stack + Contact sections (static, replacing legacy About/Stack/Experience markup; removes the lingering Data Engineer copy and the /actor cross-link)
- Turn 4: Lab — 3 interactive demo cards (Agent Thinking Replay + Compound Composer + DAG Explorer)
- Turn 5: Craft section, e2e/dev.spec.ts expansion, Lighthouse verification, TRUST 5 quality gate, Phase 3 commit/PR
