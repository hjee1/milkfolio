## Task Decomposition

SPEC: SPEC-DEV-REDESIGN-001
Generated: 2026-05-19 (Phase 1.5)

| Task ID | Description | Requirement | Dependencies | Planned Files | Status |
|---------|-------------|-------------|--------------|---------------|--------|
| T-001 | Verify R3F + React 19 compat, install three/fiber/drei/motion | REQ-DEV-E-001 | - | package.json, pnpm-lock.yaml | completed |
| T-002 | next.config.ts: BUILD_SHA + BUILD_TIME env injection | REQ-DEV-O-001, REQ-DEV-E-005 | T-001 | next.config.ts | completed |
| T-003 | Initialize progress.md + tasks.md | (process) | - | .moai/specs/SPEC-DEV-REDESIGN-001/ | completed |
| T-004 | _components/shared/tokens.ts — cyan + secondary palette | REQ-DEV-U-005 | - | app/dev/_components/shared/tokens.ts | in_progress |
| T-005 | shared/usePrefersReducedMotion hook | REQ-DEV-S-001 | T-004 | app/dev/_components/shared/usePrefersReducedMotion.ts | pending |
| T-006 | shared/useDeviceTier hook (viewport-based) | REQ-DEV-S-002 | T-004 | app/dev/_components/shared/useDeviceTier.ts | pending |
| T-007 | shared/useBuildInfo hook (read BUILD_SHA/TIME) | REQ-DEV-O-001 | T-002, T-004 | app/dev/_components/shared/useBuildInfo.ts | pending |
| T-008 | shared/useFPS hook (rAF-based measurement) | REQ-DEV-E-005, H2 | T-004 | app/dev/_components/shared/useFPS.ts | pending |
| T-009 | Hero: R3F Canvas + signature visual (particles + shader hybrid) | REQ-DEV-E-001, REQ-DEV-E-004 | T-005, T-006 | app/dev/_components/Hero.tsx, Hero.module.css | pending |
| T-010 | Hero: live system board (BUILD_SHA, FPS, fonts) overlay | REQ-DEV-E-005, REQ-DEV-O-001 | T-007, T-008 | (in Hero.tsx) | pending |
| T-011 | Hero: WebGL2 fallback (SVG/CSS gradient) | REQ-DEV-O-002 | T-009 | app/dev/_components/HeroFallback.tsx | pending |
| T-012 | Manifesto section (matagine-style typography + Motion scroll) | REQ-DEV-U-001, REQ-DEV-E-002 | T-004 | app/dev/_components/Manifesto.tsx, Manifesto.module.css | pending |
| T-013 | Stack section (new categories: Harness/AI/Engineering/Foundations) | REQ-DEV-U-003 | T-004 | app/dev/_components/Stack.tsx, Stack.module.css | pending |
| T-014 | Lab section container (Lab.tsx + LabCard.tsx) | REQ-DEV-E-003 | T-005 | app/dev/_components/Lab.tsx, LabCard.tsx | pending |
| T-015 | Lab card A: Agent Thinking Replay (recorded stream) | REQ-DEV-E-003, REQ-DEV-N-001 | T-014 | app/dev/_components/lab/AgentReplay.tsx, agent-replay.json | pending |
| T-016 | Lab card B: Compound Composer | REQ-DEV-E-003, REQ-DEV-S-003 | T-014 | app/dev/_components/lab/CompoundComposer.tsx | pending |
| T-017 | Lab card C: DAG Explorer (R3F or SVG) | REQ-DEV-E-003 | T-014, T-009 | app/dev/_components/lab/DAGExplorer.tsx | pending |
| T-018 | Craft section (live telemetry display) | REQ-DEV-E-005, H1, H2 | T-007, T-008 | app/dev/_components/Craft.tsx, Craft.module.css | pending |
| T-019 | Contact section (refresh copy, remove /actor link) | REQ-DEV-N-004 | - | app/dev/_components/Contact.tsx, Contact.module.css | pending |
| T-020 | page.tsx orchestration: assemble 6 sections, remove old markup | REQ-DEV-U-001, REQ-DEV-U-006 | T-009..T-019 | app/dev/page.tsx, app/dev/layout.tsx | pending |
| T-021 | page.module.css cleanup + token re-export | REQ-DEV-U-005 | T-004, T-020 | app/dev/page.module.css | pending |
| T-022 | e2e/dev.spec.ts expansion (6 sections, keyboard, reduced-motion, mobile) | REQ-DEV-S-001/2/3, A1, A2, B1/2/3, C1/2/3, E1, G1/2 | T-020 | e2e/dev.spec.ts | pending |
| T-023 | Lighthouse verification (Perf >= 80, A11y >= 95) | REQ-DEV-N-005, D1 | T-020, T-022 | (manual + Vercel preview) | pending |
| T-024 | TRUST 5 quality gate + MX tag scan + Phase 3 commit | (Phase 2.5 / 2.9 / 3) | T-022, T-023 | - | pending |
| T-025 | Push to origin/main + sync workflow handoff | (Phase 3 / 4) | T-024 | - | pending |

### Turn mapping (planned)

- **Turn 1**: T-001 ~ T-008 (compat + infra + shared hooks)
- **Turn 2**: T-009 ~ T-011 (Hero — XL)
- **Turn 3**: T-012, T-013, T-019 (Manifesto + Stack + Contact static)
- **Turn 4**: T-014 ~ T-017 (Lab — L)
- **Turn 5**: T-018, T-020, T-021, T-022, T-023, T-024, T-025 (Craft + assemble + verify + ship)
