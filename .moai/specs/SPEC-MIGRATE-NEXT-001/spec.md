---
id: SPEC-MIGRATE-NEXT-001
version: 1.0.0
status: InProgress
created: 2026-05-18
updated: 2026-05-18
author: Hyunwoo Jee (terryjhw@gmail.com)
priority: P1
issue_number: null
methodology: DDD
target_file: (whole site)
test_file: e2e/ (Playwright, added in phase 5)
---

# SPEC-MIGRATE-NEXT-001 — milkfolio 정적 HTML → Next.js 16 멀티-페이지 시스템 마이그레이션

## HISTORY

- 2026-05-18 — v1.0.0 — 최초 작성. 5 정적 HTML 페이지(2,322 LOC)를 Next.js 16 App Router + Tailwind v4 + shadcn/ui + TypeScript 단일 프로젝트로 통합. 7 phase 단계 마이그레이션.

---

## 1. 배경 (Why)

현재 milkfolio.space 는 5개 정적 HTML 페이지로 구성되어 GitHub Pages 에서 서빙된다:

| 페이지 | LOC | 특징 |
|---|---|---|
| `index.html` | 247 | 3-panel hover 랜딩 |
| `actor/index.html` | 218 | 서해우 배우 프로필 (한국어 serif) |
| `dev/index.html` | 280 | Terry Jee 개발자 프로필 (영어 glass) |
| `designer/index.html` | 478 | 디자이너 placeholder (실제 미배포) |
| `agent/index.html` | 1,099 | 비밀번호 게이트 + 캐스팅 대시보드 |
| **합계** | **2,322** | 페이지마다 CSS 분리, JS 는 agent 만 |

문제점:
1. **디자인 일관성 부재**: 각 페이지마다 CSS 토큰(`--accent`, 폰트 등)이 분리 정의되어, 한 곳을 바꾸면 다른 곳이 어긋남.
2. **컴포넌트 공유 불가**: 동일한 nav/footer/카드 패턴을 페이지마다 복사·붙여넣기.
3. **타입 안전성 0**: `agent/index.html` 의 1,099 LOC JS 는 vanilla — runtime 까지 가야 오타가 잡힘.
4. **agent 페이지가 비대**: data.html 파싱 + 게이트 + 검색/필터/정렬/페이지네이션이 한 파일에 들어가 유지보수 난이도 ↑.
5. **상용 best practice 부재**: 2026 기준 production 웹은 Next.js / Astro / Remix 같은 framework 위에서 구축되는 게 표준. 정적 HTML 은 portfolio one-pager 까지만.

해결: Next.js 16 + Tailwind v4 + shadcn/ui + TypeScript 단일 프로젝트로 전체 사이트 재구축. Vercel 배포로 미리보기 + 분석 + edge 캐싱 확보.

## 2. 범위 (Scope)

### IN SCOPE

- **프레임워크**: Next.js 16 (App Router, RSC, Turbopack)
- **언어**: TypeScript (strict mode)
- **스타일**: Tailwind CSS v4 (CSS-first config, postcss)
- **컴포넌트 라이브러리**: shadcn/ui (Radix UI 기반, 디자인 토큰 친화)
- **패키지 매니저**: pnpm
- **배포**: Vercel (CNAME `milkfolio.space` 이전, GitHub Pages 비활성)
- **5 페이지 모두 마이그레이션**: 랜딩, actor, dev, designer, agent
- **디자인 토큰 통합**: CSS custom properties + Tailwind theme — 단일 출처
- **공유 컴포넌트**: Nav/Footer/SectionHead/Badge 등
- **agent 페이지**: 비밀번호 게이트(SHA-256 client-side 유지), data.html 파싱은 RSC + Server Action 으로 이동
- **언어**: agent UI 모든 라벨 한국어로 (현재 영문 혼재)
- **e2e 테스트**: Playwright 로 5 페이지 스모크 (phase 5)

### OUT OF SCOPE

- **데이터 모델 변경**: `data.html` 의 구조 (h2 + table) 는 그대로 받음. casting-agent push target 변경 없음 (다음 SPEC).
- **인증 강화**: SHA-256 client-side gate 그대로. Clerk/Auth0 같은 server-side auth 는 별도 SPEC.
- **CMS 도입**: 정적 카피만 — Sanity/Contentlayer 같은 CMS 없음.
- **국제화**: agent UI 한국어 단일, actor 한국어, dev 영어 — 현재 카피 언어 유지. i18n 라우팅 없음.
- **다크/라이트 토글**: 현재 모두 다크. 라이트 모드는 별도 SPEC.
- **PWA / 오프라인**: 미적용.
- **백엔드 / API**: agent `app/api/data/route.ts` 만 — casting-agent push 된 `data.html` 을 캐싱·파싱·반환. 그 외 API 없음.

---

## 3. 요구사항 (Requirements — EARS 형식)

### REQ-001 — 단일 Next.js 프로젝트 [P1]

**Pattern**: State-Driven

WHILE 마이그레이션이 완료된 상태에서,
THE SYSTEM SHALL 모든 5 페이지(`/`, `/actor`, `/dev`, `/designer`, `/agent`)를 단일 `app/` 라우터 아래 호스팅한다.

### REQ-002 — 디자인 토큰 단일 출처 [P1]

**Pattern**: State-Driven

WHILE 마이그레이션이 완료된 상태에서,
THE SYSTEM SHALL 모든 색상·폰트·간격·라운드 값을 `styles/tokens.css` (또는 `app/globals.css` 의 `@theme` 블록) 하나에서 정의하고, 모든 페이지가 이를 참조한다.

### REQ-003 — 페이지별 비주얼 동등성 [P1]

**Pattern**: Ubiquitous

THE SYSTEM SHALL 마이그레이션 전후 각 페이지의 핵심 비주얼(레이아웃, 색감, 타이포)을 시각적으로 90% 이상 유사하게 유지한다. agent 페이지만 UX 개선(한국어화, 가독성 강화, 섹션 단순화) 포함.

### REQ-004 — agent 데이터 흐름 [P1]

**Pattern**: Event-Driven

WHEN 사용자가 비밀번호 입력 후 게이트를 통과하면,
THE SYSTEM SHALL `app/api/data/route.ts` 를 통해 `data.html` 을 가져와 서버에서 파싱하고, 파싱된 구조화 데이터(applications, periods, sources, anomalies, cost)를 클라이언트 컴포넌트에 props 로 전달한다.

### REQ-005 — agent UI 한국어화 [P1]

**Pattern**: Ubiquitous

THE SYSTEM SHALL agent 페이지의 모든 사용자-노출 텍스트(버튼·라벨·placeholder·태그)를 한국어로 작성한다. 코드 식별자(컴포넌트명·변수명) 는 영어 유지.

### REQ-006 — Vercel 배포 + CNAME [P1]

**Pattern**: State-Driven

WHILE production 환경에서,
THE SYSTEM SHALL Vercel 에 자동 배포되며, `milkfolio.space` 도메인이 Vercel 프로젝트에 연결되어 있다. GitHub Pages 빌드는 비활성화된다.

### REQ-007 — casting-agent 호환성 [P1]

**Pattern**: Ubiquitous

THE SYSTEM SHALL `hjee1/casting-agent` 가 push 하는 `data.html` 의 위치/포맷이 변경되지 않도록 한다. (casting-agent 수정 없이 새 Next.js 사이트가 같은 `data.html` 을 소비)

### REQ-008 — 타입 안전성 [P2]

**Pattern**: Ubiquitous

THE SYSTEM SHALL TypeScript strict mode 로 빌드되며, 어떤 `any` 사용도 명시적 주석(`// @ts-expect-error` 또는 `as unknown as`) 없이는 허용하지 않는다.

---

## 4. 인수 기준 (Acceptance Criteria)

### AC-1 — 로컬 빌드
- `pnpm install && pnpm build` 가 오류 없이 완료된다.
- `pnpm dev` 가 5 페이지를 모두 렌더링한다.

### AC-2 — 디자인 토큰 단일 출처
- `app/globals.css` 또는 `styles/tokens.css` 에 `--accent`, `--bg`, `--text` 등 토큰이 정의된다.
- 어떤 페이지도 자체 CSS 파일에서 색상값을 hex 로 hardcode 하지 않는다 (Tailwind utility 또는 토큰 변수만 사용).

### AC-3 — 5 페이지 라우팅
- `/` 가 랜딩 페이지를 반환한다.
- `/actor`, `/dev`, `/designer`, `/agent` 가 각 페이지를 반환한다.
- 404 핸들러가 `app/not-found.tsx` 에 정의된다.

### AC-4 — agent 게이트
- 잘못된 비밀번호 입력 시 에러 메시지 표시.
- 올바른 비밀번호 입력 시 sessionStorage 토큰 저장 + 대시보드 표시.

### AC-5 — agent 데이터 파싱
- `app/api/data/route.ts` 가 `data.html` 을 fetch 하여 JSON 으로 반환.
- 클라이언트 컴포넌트가 이 JSON 을 받아 검색/필터/정렬 동작 그대로 유지.

### AC-6 — agent 한국어화
- 모든 버튼·라벨·placeholder 가 한국어. 영문 라벨 0건.
- 데이터값(이메일·URL) 은 원문 그대로.

### AC-7 — Vercel 배포
- `milkfolio.space` 가 Vercel 응답을 반환한다 (HTTP 응답 헤더로 확인).
- GitHub Pages 의 `pages-build-deployment` workflow 가 비활성화 또는 차단된다.

### AC-8 — 기존 GitHub Pages 무중단 fallback
- 마이그레이션 완료 시점까지 기존 HTML 파일들이 `main` 브랜치에 그대로 존재한다 (rollback 가능).
- 마이그레이션 검증 완료 후 별도 commit 에서 legacy HTML 제거.

---

## 5. Phase 분할

1. **Phase 1 — 스캐폴딩 + 랜딩** (이 commit): SPEC + Next.js 셋업 + 디자인 토큰 + 랜딩 페이지(`/`).
2. **Phase 2 — 정적 프로필**: actor, dev, designer 페이지.
3. **Phase 3 — agent 게이트 + 데이터 파싱**: 비밀번호 게이트 + `app/api/data/route.ts` + parser 라이브러리.
4. **Phase 4 — agent UI**: 한국어화된 검색/필터/정렬/페이지네이션, 결과 카운트, cost colophon.
5. **Phase 5 — Playwright e2e**: 5 페이지 스모크 + agent 핵심 플로우 테스트.
6. **Phase 6 — Vercel 배포**: 프로젝트 연결, 환경 변수, 도메인.
7. **Phase 7 — Legacy 제거**: 검증 후 기존 HTML 파일 제거.

각 phase 종료 시 사용자 검증 받고 다음 phase 진행.

---

## 6. 위험 및 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| Tailwind v4 학습곡선 (CSS-first config) | 시간 ↑ | 공식 docs 참조, v3 와 호환되는 utility 위주 |
| Next.js 16 fresh release 안정성 | 빌드 실패 가능 | Phase 1 종료 시 `pnpm build` 검증 |
| agent `data.html` 파싱이 RSC 에서 정상 동작 | 데이터 표시 실패 | Phase 3 별도 phase 로 분리, parser 단위 테스트 |
| Vercel 무료 티어 한도 | 트래픽 제한 | 현재 트래픽 미미 (사적 사이트), 무료 충분 |
| GitHub Pages → Vercel CNAME 전환 다운타임 | 도메인 5~30분 미접속 | 새벽 시간대 전환, DNS TTL 미리 조정 |
| casting-agent push target 호환성 | 대시보드 데이터 끊김 | `data.html` 위치 동일하게 유지 (REQ-007) |

---

Version: 1.0.0
Phase 1 in this commit.
