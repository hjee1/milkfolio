# milkfolio

Multi-identity portfolio at **milkfolio.space**.
세 페르소나 + 비공개 캐스팅 대시보드를 한 도메인 아래 분리된 라우트로 호스팅.

| 라우트 | 페르소나 | 상태 |
|---|---|---|
| `/` | 3-panel hover-expand 랜딩 | Live |
| `/actor` | 서해우 (Korean, Editorial Magazine 6섹션) | Live — SPEC-ACTOR-REDESIGN-001 완료 |
| `/dev` | Hyunwoo Jee — AI Technical Engineer (English) | 재설계 중 — SPEC-DEV-REDESIGN-001 |
| `/designer` | Yuna Jee 디자이너 포트폴리오 | Live |
| `/agent` | 비공개 캐스팅 대시보드 (SHA-256 게이트) | Live |

## 스택

- **Next.js 16.2.6 (App Router) + React 19.2.6 + TypeScript 5.7 strict**
- **Tailwind CSS 4.3** (PostCSS 플러그인) + CSS Modules 하이브리드
- **pnpm 10.0.0** (frozen lockfile, `corepack` 권장)
- **Vercel** 호스팅 (region `icn1`, main push 자동 배포)
- E2E: Playwright (`pnpm e2e`)
- /dev 재설계 도입 예정: Three.js + R3F + Motion

전체 의존성·버전 표는 `.moai/project/tech.md` 참조 (Single Source of Truth).

## 디렉터리 (최상위만)

```
app/                — Next.js App Router (페르소나별 라우트 세그먼트)
  ├── page.tsx, page.module.css       — 랜딩 (/)
  ├── actor/_components/              — Hero, Reel, Roles, Filmography, Contact 등
  ├── dev/                            — ★ SPEC-DEV-REDESIGN-001 작업 영역
  ├── designer/                       — 9 case studies + ProjectGallery
  └── agent/                          — actions.ts (Server Action) + AgentClient.tsx
components/         — 공유 UI (SiteNav, SiteFooter)
lib/                — cn.ts, parse-data-html.ts, types/
public/             — 정적 자산 (actor/, designer/)
agent/data.html     — ← 절대 수정 금지. casting-agent 워크플로우가 자동 push.
e2e/                — Playwright 회귀 (5 라우트)
docs/               — 마이그레이션 히스토리 (DEPLOY-VERCEL, PHASE-7-LEGACY-REMOVAL)
.moai/project/      — product.md / structure.md / tech.md — 프로젝트 컨텍스트 SoT
```

세부 구조는 `.moai/project/structure.md` 참조.

## 디자인 룰 (핵심만)

- 페르소나별 CSS Module 격리. `globals.css`는 reset + 폰트 변수만.
- /actor 액센트: `#7c6240` (off-white 위 WCAG AA 5.25:1) / `#b8a98a` (carbon hero 전용)
- /dev 액센트: `#38d9ff` cyan
- /designer 액센트: `#d4b8cc` soft pink/lavender
- 폰트: `next/font` 기본. /actor는 globals.css `@import` + Pretendard CDN(jsdelivr) — Somansa 프록시에서 `next/font` 실패 fallback.
- WCAG 2.1 AA, Lighthouse Performance ≥ 80 (모든 라우트).

## `/agent` — Server Action 기반 데이터 로딩 [중요]

마이그레이션 전 GitHub Pages 시절의 `innerHTML` + 스크립트 재실행 패턴은 **이미 제거됨**. 현재 흐름:

1. `agent/data.html`은 외부 리포 `hjee1/casting-agent`의 GitHub Actions가 main에 push.
2. `app/agent/actions.ts`의 `fetchAgentData()` Server Action이 `path.join(process.cwd(), "agent", "data.html")`에서 파일을 읽음.
3. `lib/parse-data-html.ts` (cheerio)가 HTML을 구조화 데이터로 파싱.
4. `app/agent/AgentClient.tsx`("use client")가 SHA-256 게이트 통과 후 데이터를 받아 5 섹션 대시보드 렌더링.
5. 인증 상태는 `sessionStorage.agent_auth`에 유지.

규칙:
- `agent/data.html`을 절대 수동 편집하지 말 것 (다음 cron에 덮어쓰임).
- 비밀번호 해시는 `AgentClient.tsx`의 `HASH` 상수 (`3324dab8...`).
- 파일 경로 이동(예: `public/agent/data.html`)은 별도 SPEC로. casting-agent 리포의 push target과 동시에 바꿔야 함.

## 인프라

- **Registrar:** Namecheap (`milkfolio.space`)
- **DNS:** A → Vercel anycast (`216.198.79.1`, `64.29.17.1`), CNAME `www` → `cname.vercel-dns.com.`
- **호스팅:** Vercel, GitHub `hjee1/milkfolio` main 브랜치 자동 배포
- **Old:** `hjee1/seo-haewoo-actor` (deprecated), GitHub Pages (Phase 7에서 비활성화 완료)

### 회사망 접속 안 됨 = Somansa DLP 차단 [기록용]

한화시스템 사내망(SSL inspection 가동)에서는 `milkfolio.space`가 도메인 카테고리 미분류로 차단되어 ERR_TIMED_OUT. 사이트·DNS·Vercel은 정상. 회사망 밖(집·모바일·카페)에서는 정상 작동. 진단 방법은 `~/.claude/projects/-Users-hyunwoojee-milkfolio/memory/project_milkfolio_infra.md` 참조.

## 작업 컨벤션

- Server Components 기본, 인터랙션 필요한 자식만 `"use client"`.
- `lib/` 유틸은 pure functions, 사이드이펙트 0.
- `any` 금지, `unknown` narrowing 후 사용.
- 모든 의미 있는 변경은 즉시 commit + push (배치 금지).
- Commit 메시지: Conventional Commits (`feat(actor):`, `fix(agent):`, `chore(legacy):` 등).

## Pending / Roadmap

- **진행 중**: SPEC-DEV-REDESIGN-001 — /dev 풀파워 재설계 (WebGL Hero + Manifesto + Lab + Stack + Craft + Contact)
- 공통: favicon, OG 메타, sitemap, back-to-top
- 선택: `agent/data.html` → `public/agent/data.html` 이전 (별도 SPEC, casting-agent 동기 변경 필요)

## 더 깊은 컨텍스트가 필요할 때

- 제품·페르소나·KPI: `.moai/project/product.md`
- 디렉터리·페르소나별 컴포넌트: `.moai/project/structure.md`
- 스택·버전·성능 목표·CI 게이트: `.moai/project/tech.md`
- SPEC 문서: `.moai/specs/`
- 마이그레이션 히스토리: `docs/DEPLOY-VERCEL.md`, `docs/PHASE-7-LEGACY-REMOVAL.md`, `PROJECT_LOG.md`


---

## Second Brain — Obsidian-Knowledge

**작업 시작 전 항상 `~/Documents/Obsidian-Knowledge` 를 먼저 참조**한다.

- 이 프로젝트 페이지: `~/Documents/Obsidian-Knowledge/projects/personal/milkfolio.md` (auto-sync from `.moai/project/*.md`)
- 프로젝트 설명: 개인 포트폴리오 (배우/개발자/디자이너 3-페르소나)
- Vault 색상: 보라 (personal)

의미 있는 결정·패턴·상태 변경 시 vault에 즉시 반영. 정책 전문은 `~/.claude/CLAUDE.md` 의 "Obsidian-Knowledge = Second Brain (HARD POLICY)".

**Vault 동기화:**

```bash
cd ~/Documents/Obsidian-Knowledge && .venv/bin/python _meta/scripts/sync_moai.py
```
