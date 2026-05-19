---
id: SPEC-DEV-REDESIGN-001
version: 1.0.0
status: draft
created: 2026-05-19
updated: 2026-05-19
author: Hyunwoo Jee (terryjhw@gmail.com)
priority: P1
issue_number: 0
methodology: DDD
target_file: app/dev/page.tsx + app/dev/_components/**
test_file: e2e/dev.spec.ts
---

# SPEC-DEV-REDESIGN-001 — `/dev` 풀파워 재설계 (AI Technical Engineer 정체성)

## HISTORY

- 2026-05-19 — v1.0.0 — 최초 작성. 정적 5섹션 Pure Server Component를 6섹션 시네마틱 인터랙티브 페이지로 전면 재설계. 정체성을 Data Platform Engineer → AI Technical Engineer로 전환. "Portfolio IS the Proof" narrative 채택. Three.js/R3F + Motion + Lottie 풀파워 기술 예산 승인.

---

## 1. 배경 (Why)

### 현재 상태
`milkfolio.space/dev` 페이지(`app/dev/page.tsx`, 350 LOC, 5섹션 정적 마크업)는 "Data Engineer at Hanwha System" 정체성으로 작성되어 있다. 클라이언트 JS 0, 인터랙션 0, 정적 그리드 hero. 평범한 자기소개 포트폴리오.

### 문제점
1. **정체성 outdated** — 사용자는 한화시스템 AI기술팀으로 이동 완료. 현재는 AI Technical Engineer로서 Claude Code/Harness Engineering/MoAI/Compound Engineering 표준화를 주도. 페이지의 Airflow/Snowflake/Cognite 위주 표기는 사실과 어긋남.
2. **임팩트 부족** — 정적 콘텐츠는 "와, 직접 만들었다고?" 반응을 끌어내지 못함. 평범한 텍스트·카드 나열.
3. **콘텐츠 공개 제약** — 회사 NDA 및 개인 정책상 실제 작업물·프로젝트 디테일을 공개할 수 없음. 일반적 포트폴리오 접근(작업물 갤러리)을 사용 불가.

### 해결 방향
**"The Portfolio IS the Proof"** — 사이트의 craft 자체를 작업물로 격상. 외부 콘텐츠 없이 페이지의 디테일·인터랙션·기술적 완성도가 실력을 증명한다.

---

## 2. 범위 (Scope)

### IN SCOPE

- `app/dev/page.tsx` 전면 재작성 (6섹션 구조)
- `app/dev/_components/` 신규 디렉터리 + 6개 섹션 컴포넌트
- `app/dev/page.module.css` 액센트 컬러 시스템 확장 (cyan #38d9ff 유지 + 보조 톤)
- `app/dev/layout.tsx` 메타데이터 업데이트 (직함·OG 이미지)
- 신규 라이브러리: `three`, `@react-three/fiber`, `@react-three/drei`, `motion` (필요시 `lottie-react`)
- `e2e/dev.spec.ts` Playwright 회귀 확장 (새 섹션 / 인터랙션 / 접근성)
- 빌드 시 메타데이터 주입 설정 (next.config.ts: commit SHA, build time)

### OUT OF SCOPE

- `/actor`, `/designer`, `/agent` 페이지 (별개 SPEC)
- 공유 컴포넌트 변경 (`components/SiteNav`, `components/SiteFooter`) — /dev는 인라인 nav 사용
- 글로벌 토큰 변경 (`app/globals.css`)
- 새로운 라우트 추가 (`/dev/lab`, `/dev/projects` 등 별도 경로 ✗)
- 백엔드 API 추가 (Server Actions 도입 ✗ — Lab은 사전 녹화 데이터)
- 실시간 LLM API 호출 (Anthropic/OpenAI/Mistral 등)
- 실제 회사·개인 프로젝트 콘텐츠 노출
- 배우(서해우) 정체성과의 cross-link (사용자가 명시한 "직업 완벽 분리" 원칙)

---

## 3. EARS 요구사항

### Ubiquitous (항상 참)

- **REQ-DEV-U-001**: `/dev` 페이지는 6개 섹션(Hero / Manifesto / Lab / Stack / Craft / Contact)으로 구성된다.
- **REQ-DEV-U-002**: 페이지의 모든 텍스트는 영어로 작성된다. 사용자 이름의 한글 표기(지현우)는 예외로 한 곳에 허용된다.
- **REQ-DEV-U-003**: 페이지는 "AI Technical Engineer" 직함으로 사용자를 소개한다. "Data Engineer", "Data Platform Engineer" 표현은 등장하지 않는다.
- **REQ-DEV-U-004**: 페이지는 실제 회사 프로젝트 디테일, 한화시스템 내부 정보, 또는 식별 가능한 개인 사이드 프로젝트 콘텐츠를 노출하지 않는다.
- **REQ-DEV-U-005**: 페이지는 cyan 액센트 컬러(#38d9ff)를 시그니처로 유지하며, 보조 톤은 동일 색상 패밀리 내에서 추가한다.
- **REQ-DEV-U-006**: 페이지는 Next.js 16 App Router 기반 Server Component로 시작하고, 인터랙션이 필요한 자식만 Client Component로 분리한다.

### Event-Driven (이벤트 발생 시)

- **REQ-DEV-E-001**: WHEN 사용자가 페이지에 진입하면, Hero 섹션의 시네마틱 WebGL 시각화가 초기 프레임 200ms 이내에 표시된다.
- **REQ-DEV-E-002**: WHEN 사용자가 스크롤을 시작하면, 각 섹션의 콘텐츠가 Motion variants를 통해 페이드인 + 약한 translate로 진입한다.
- **REQ-DEV-E-003**: WHEN 사용자가 Lab 섹션의 인터랙티브 카드를 클릭하거나 키보드로 활성화하면, 사전 녹화된 시퀀스 또는 컴포지션 결과가 즉시 재생/표시된다.
- **REQ-DEV-E-004**: WHEN 사용자가 마우스를 Hero 영역에서 움직이면, WebGL 파티클이 미세하게 반응한다 (과한 변형 금지).
- **REQ-DEV-E-005**: WHEN 페이지 로드가 완료되면, Craft 섹션은 실측 데이터(렌더 FPS, 폰트 로드 상태)를 클라이언트 사이드에서 표시한다.

### State-Driven (상태 조건)

- **REQ-DEV-S-001**: WHILE `prefers-reduced-motion: reduce`가 활성화된 환경에서, 모든 자동 애니메이션은 비활성화되고 WebGL hero는 정적 첫 프레임만 표시한다.
- **REQ-DEV-S-002**: WHILE 뷰포트 너비가 768px 미만인 경우, WebGL 파티클 수는 데스크톱 대비 50% 이하로 감소하고, 일부 인터랙티브 데모는 단순화된 변형으로 표시된다.
- **REQ-DEV-S-003**: WHILE 사용자가 키보드만으로 탐색하는 경우, 모든 인터랙티브 요소는 `Tab` 순회 가능하며 포커스 링이 명확히 표시된다.

### Optional (선택적 기능)

- **REQ-DEV-O-001**: WHERE 빌드 환경 변수(`VERCEL_GIT_COMMIT_SHA`, `BUILD_TIME`)가 제공된 경우, Craft 섹션은 해당 값을 라이브 표시한다. 미제공 시 fallback 문자열(`local-dev`)을 표시한다.
- **REQ-DEV-O-002**: WHERE 브라우저가 WebGL2를 지원하지 않는 경우, Hero는 정적 SVG/CSS gradient fallback으로 대체된다.
- **REQ-DEV-O-003**: WHERE Lottie 모션이 채택된 경우, 해당 자산은 dynamic import로 로드되어 초기 번들에 포함되지 않는다.

### Unwanted (금지 조건)

- **REQ-DEV-N-001**: 페이지는 외부 LLM/AI API(Anthropic, OpenAI, Mistral 등)를 런타임에 호출하지 않는다.
- **REQ-DEV-N-002**: 페이지는 third-party 분석 스크립트(Google Analytics, Hotjar 등)를 새로 추가하지 않는다. (Vercel Analytics는 기존 정책 유지.)
- **REQ-DEV-N-003**: 페이지는 사용자에게 회원가입·구독·뉴스레터를 요청하지 않는다.
- **REQ-DEV-N-004**: 페이지는 `/actor` 또는 서해우 정체성으로의 명시적 링크나 언급을 포함하지 않는다 ("직업 완벽 분리" 원칙).
- **REQ-DEV-N-005**: 페이지는 Lighthouse Performance 점수 80 미만을 허용하지 않는다.

---

## 4. 섹션별 세부 명세

### Section 0 — Hero

[DELTA] 기존 `<section className={styles.hero}>` 정적 그리드 hero
- [REMOVE] CSS grid 배경, 정적 칩 리스트
- [NEW] `_components/Hero.tsx` (Client) — R3F Canvas 풀-뷰포트
- [NEW] 시그니처 비주얼: 뉴럴-네트워크풍 파티클 + DAG 노드 토폴로지 하이브리드
- [NEW] 사이드 시스템 보드 (commit hash, build age, FPS, font status)
- [NEW] 큰 타이포 `Hyunwoo Jee.` + 서브타이틀 `AI Technical Engineer`
- [NEW] 스크롤 힌트 (작은 모션 트리거)

### Section 1 — Manifesto / Now

[NEW] 기존에 없던 섹션
- 매거진풍 큰 타이포 statement
- 현재 활동의 추상화된 리스트:
  - "Standardizing AI engineering workflows at an enterprise scale"
  - "Researching at the frontier of Claude Code, Harness Engineering, and Compound Engineering"
  - "Collaborating with international AI partners"
- 회사명(한화시스템) 명시 가능하나 내부 프로젝트 상세는 금지
- Motion 스크롤 페이드인

### Section 2 — Lab (Interactive Demos)

[NEW] 기존에 없던 섹션. 가장 wow한 부분.
- 3-4개 인터랙티브 카드 그리드
- 각 카드: 사전 녹화 데이터 + R3F/Canvas/Motion 시각화
- 후보 (구현 시 최소 3개 채택):
  - **Agent Thinking Replay** — 타이프라이터 스트림
  - **Compound Composer** — 위젯 조합 → 동적 결과
  - **DAG Explorer** — 노드 드래그·재구성
  - **Particle Conductor** — 마우스 따라 흐름 변형
- 코드 스플릿 (`next/dynamic`)
- 각 데모는 키보드로도 활성화 가능

### Section 3 — Stack & Approach

[DELTA] 기존 6장 Stack 카드 (Orchestration/Data Platform/Industrial IoT/...)
- [REMOVE] Airflow/Databricks/Snowflake/Cognite 위주 분류
- [NEW] 새 카테고리:
  - Harness & Orchestration (Claude Code, MoAI, Compound Engineering)
  - AI Models & APIs (Anthropic Claude, Mistral, etc.)
  - Engineering (TypeScript, Next.js 16, React 19, Three.js)
  - Foundations (Python, SQL — 유지)
- 시각화: 카드 또는 R3F 노드 그래프 (Lab과 차별화)

### Section 4 — Craft / This Page

[NEW] 메타 자기참조 섹션
- 라이브 텔레메트리 (모두 클라이언트 사이드 또는 빌드 시 주입):
  - 빌드 SHA (앞 7자)
  - 빌드 경과 시간 ("deployed 3h ago")
  - 현재 렌더 FPS (실측)
  - 폰트 로드 상태
  - 번들 크기 (사전 측정 표시)
  - Lighthouse 점수 스냅샷 (사전 측정 표시)
- 모노스페이스 폰트 (Fira Code) 활용
- 작은 "stack details" 리스트 (라이브러리 + 버전)

### Section 5 — Contact

[DELTA] 기존 Contact 섹션
- [MODIFY] 큰 타이포 변경 ("Let's build something real." 등)
- [MODIFY] 가용성 한 줄 추가 ("Open to AI engineering collaborations and consulting")
- [EXISTING] 이메일·LinkedIn 링크 유지
- [REMOVE] 배우 정체성으로의 inline link (`<Link href="/actor">서해우</Link>`)

---

## 5. 비기능 요구사항

| 영역 | 목표 |
|---|---|
| Lighthouse Performance (모바일) | **>= 80** |
| Lighthouse Accessibility | **>= 95** |
| Lighthouse Best Practices | **>= 95** |
| LCP (모바일) | < 2.5s |
| CLS | < 0.1 |
| 초기 JS 번들 (gzip) | < 250KB (R3F + Motion 포함) |
| WCAG 준수 | 2.1 AA |
| `prefers-reduced-motion` | 완전 존중 |
| 키보드 네비게이션 | 모든 인터랙티브 요소 |
| 모바일 (320px) | 그레이스풀 디그레이드 |

---

## 6. Exclusions (What NOT to Build)

> [HARD] 이 SPEC에서 명시적으로 만들지 않는 것들

1. **실시간 LLM API 호출 기능** — Lab의 모든 "AI" 데모는 사전 녹화/추상 시각화에 한정.
2. **새 라우트** — `/dev/lab`, `/dev/projects` 등 서브 라우트 만들지 않음. 모든 콘텐츠는 단일 `/dev` 페이지의 섹션으로.
3. **백엔드 / Server Actions** — `/agent`만 Server Actions 사용. `/dev`는 정적 + 클라이언트 인터랙션만.
4. **블로그 / CMS 통합** — Contentful, MDX 라우트 등 도입하지 않음.
5. **공유 컴포넌트 변경** — `SiteNav`/`SiteFooter` 수정 금지. /dev는 인라인 nav 유지 또는 별도 nav 컴포넌트.
6. **다른 페르소나 페이지(/actor, /designer, /agent) 변경** — 별개 SPEC.
7. **배우 정체성으로의 cross-link** — 사용자 명시 ("직업 완벽 분리").
8. **회사 내부 정보 / 실제 작업물 디테일** — NDA·정책 회피.
9. **계정 시스템 / 댓글 / 이메일 구독** — /dev는 일방향 sell 포트폴리오.
10. **다국어 (i18n)** — /dev는 영어 고정.

---

## 7. 의존성 & 위험

### 신규 패키지 의존성
- `three@^0.x` (latest stable)
- `@react-three/fiber@^9.x` (React 19 호환 확인)
- `@react-three/drei@^10.x` (선택적)
- `motion@^11.x` (구 framer-motion, React 19 호환)
- `lottie-react@^2.x` 또는 `@lottiefiles/dotlottie-react@^0.x` (필요 시)

### 주요 위험
- **R3F + React 19 RC 호환성** — Context7로 최신 docs 확인 필수
- **Lighthouse 80 미만 위험** — Hero lazy load + 모바일 파티클 감소 필수
- **모바일 발열·배터리** — `useFrame` 루프 throttle 또는 `IntersectionObserver`로 viewport 밖 정지
- **번들 크기 폭증** — 모든 새 코드는 dynamic import + 라우트 코드 스플릿

### 완화 액션
- `next.config.ts`에 webpack bundleAnalyzer 임시 활성화하여 측정
- Lighthouse 점수 사전 측정 후 PR 게이트로 자동화
- `e2e/dev.spec.ts`에 키보드 탐색 + reduced-motion 케이스 추가

---

## 8. MX 태그 계획 (의무)

| 위치 | 태그 | 사유 |
|---|---|---|
| `_components/Hero.tsx` `useFrame` 콜백 | `@MX:WARN` | 매 프레임 호출되는 핫 패스, 사이드 이펙트 위험 |
| `_components/Lab.tsx` 카드 dynamic import | `@MX:NOTE` | 코드 스플릿 의도 명시 |
| `_components/Craft.tsx` FPS 측정 훅 | `@MX:NOTE` | 클라이언트 전용, SSR 시 빈 값 fallback |
| `next.config.ts` 환경 변수 주입 | `@MX:ANCHOR` | 빌드 시점에 한 번, 모든 페이지 영향 |
| WebGL fallback 분기 | `@MX:WARN` | 브라우저 호환성 분기, 회귀 위험 |

---

## 9. 완료 정의 (Definition of Done)

- [ ] 모든 EARS 요구사항(REQ-DEV-U/E/S/O/N)이 구현 또는 회피로 처리됨
- [ ] `pnpm typecheck` 통과 (strict)
- [ ] `pnpm lint` 통과
- [ ] `pnpm e2e` 전체 통과 (특히 `dev.spec.ts` 확장본)
- [ ] Lighthouse Performance >= 80 (모바일), Accessibility >= 95
- [ ] `prefers-reduced-motion` 환경에서 정적 fallback 확인
- [ ] 키보드 only 탐색으로 모든 인터랙티브 요소 도달 가능
- [ ] 모바일 320px ~ 4K 시각적 회귀 없음
- [ ] 사용자가 PR 미리보기에서 "와" 반응을 확인 (정성적 게이트)

---

## 10. 참조

- `research.md` — 깊이 있는 사전 분석
- `plan.md` — 구현 단계
- `acceptance.md` — Given/When/Then 시나리오
- `SPEC-MIGRATE-NEXT-001` — Next.js 마이그레이션 SPEC (선행)
- 사용자 메모리: `~/.claude/projects/-Users-hyunwoojee-milkfolio/memory/user_role.md`
- 사용자 메모리: `~/.claude/projects/-Users-hyunwoojee-milkfolio/memory/project_milkfolio_dev_redesign.md`
