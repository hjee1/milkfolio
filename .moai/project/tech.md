# Tech — milkfolio

## 핵심 스택

| 영역 | 기술 | 버전 | 출처 |
|---|---|---|---|
| 프레임워크 | Next.js | **16.2.6** | `package.json` |
| UI 라이브러리 | React | **19.2.6** | `package.json` |
| 언어 | TypeScript | **5.7.2** | strict mode (`tsconfig.json`) |
| 스타일링 | Tailwind CSS | **4.3.0** | PostCSS 플러그인 방식 |
| 유틸 | `clsx` | 2.1.1 | 조건부 클래스 |
| 유틸 | `tailwind-merge` | 2.5.4 | Tailwind 중복 제거 |
| 유틸 | `class-variance-authority` | 0.7.1 | variant 패턴 |
| HTML 파싱 | `cheerio` | ^1.2.0 | `/agent` data.html 파싱용 |
| E2E 테스트 | Playwright | ^1.60.0 | `e2e/*.spec.ts` |
| 패키지 매니저 | pnpm | **10.0.0** | `pnpm-lock.yaml` |
| 호스팅 | Vercel | — | `vercel.json` |
| 빌드 도구 | Turbopack | (Next.js 16 내장) | `dev` 스크립트 기본값 |

## SPEC-DEV-REDESIGN-001에서 추가 도입할 라이브러리

| 라이브러리 | 용도 | 예상 크기 (gzip) |
|---|---|---|
| `three` | WebGL 코어 (Hero 시네마틱 비주얼) | ~160KB |
| `@react-three/fiber` | React용 Three.js 선언적 렌더러 | ~30KB |
| ~~`@react-three/drei`~~ | 미채택 — 필요 시점에 재도입 | — |
| ~~`motion`~~ | 미채택 (설치 후 미사용으로 2026-08-21 제거) — CSS 애니메이션으로 충당 | — |
| ~~`lottie-react`~~ | 미채택 | — |

**번들 임팩트 합계**: 대략 320KB gzip 증가 예상. /dev 단일 라우트로 코드 스플릿 → 다른 페르소나(/actor, /designer, /agent)에는 영향 없음.

## TypeScript 설정 (요지)

- `strict: true`
- `moduleResolution: "bundler"`
- `paths: { "@/*": ["./*"] }` — 절대 경로 임포트 지원
- `jsx: "preserve"` — Next.js가 트랜스폼
- `noEmit: true` — 타입 체크만, 빌드는 Next.js에 위임

## 폰트 시스템

- **랜딩 (`/`)**: Cormorant Garamond (이름) + Space Grotesk (UI)
- **/actor**: Cormorant Garamond (라틴 serif 디스플레이) + Pretendard (국문 sans 본문/UI) — SPEC-ACTOR-REDESIGN-001 LD1 (Noto Serif KR은 actor 범위에서 제거됨)
- **/dev**: Space Grotesk + Inter + Fira Code (영어, 모노스페이스 액센트)
- **/designer**: TBD (소프트 톤)

폰트 로딩: 랜딩·`/dev`·`/designer`는 Next.js `next/font` 사용. `/actor`는 `globals.css @import` + Pretendard CDN(jsdelivr) — Somansa 프록시에서 `next/font` 실패로 인한 fallback. 향후 self-host woff2 권장.

## 컬러·테마 토큰

- 랜딩: `#0a0e1a` 베이스
- **/dev 액센트**: `#38d9ff` (cyan) — SPEC-DEV-REDESIGN-001에서 보조 톤 추가 예정
- **/actor 액센트** (SPEC-ACTOR-REDESIGN-001 LD2 v2, 2026-05-21):
  - body off-white(`#f8f5f0`) 위: `accentGold` `#7c6240` (실측 5.25:1 WCAG AA) — eyebrow + role-type tag + hairline (REQ-ACT-U-011 gold 3 zone)
  - hero carbon(`#0a0a0a`) 위 전용: `accentGoldOnDark` `#b8a98a` (원본 warm gold, ~10:1) — Hero eyebrow만
- /designer 액센트: `#d4b8cc` (soft pink/lavender, placeholder)

## 보안·인증

### /agent 비밀번호 게이트
- 클라이언트 사이드 SHA-256 해시 비교
- `sessionStorage`에 인증 상태 유지 (브라우저 종료 시 자동 만료)
- 비밀번호 해시: `069d081...` (실제 비밀번호의 SHA-256)
- **주의**: 진정한 보안이 아닌 *간단한 접근 제어*. 민감 정보는 데이터 자체에 포함하지 않음.

### CSP (Content Security Policy)
- Vercel 기본 CSP 활용
- /dev에서 Three.js shader는 inline JS 아니라 import → CSP 충돌 없음

## 성능 목표 (Lighthouse)

| 페르소나 | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | >= 95 | >= 95 | >= 95 | >= 95 |
| `/actor` | **>= 80** (REQ-ACT-N-006) | >= 95 (E4) | >= 95 | >= 95 |
| `/dev` (재설계 후) | **>= 80** ★ | >= 95 | >= 95 | >= 90 |
| `/designer` | >= 95 | >= 95 | >= 95 | >= 95 |
| `/agent` | >= 85 | >= 90 | >= 95 | (비공개) |

★ /dev는 WebGL/Three.js 도입으로 Performance 천장이 다소 낮춰지나 80 이하로 내려가면 안 됨.

/actor도 Hero `<video>` 활성 후 LCP·CLS 부담이 있어 80 floor. SPEC-ACTOR-REDESIGN-001 acceptance F1/F3 (LCP < 2.5s, CLS < 0.1) 동반 검증 필수.

## 브라우저 호환성

- **타깃**: ES2022 (Chrome 100+, Safari 15+, Firefox 100+)
- **불필요 폴리필 제외**: Next.js의 SWC 트랜스파일러가 자동 최적화
- **WebGL2 필수**: `/dev` 재설계에서 fallback은 정적 SVG 또는 CSS gradient

## CI / 품질 게이트

- `pnpm typecheck` — TypeScript strict 통과
- `pnpm lint` — Next.js + ESLint
- `pnpm e2e` — Playwright 회귀 (lan­ding/actor/dev/designer/agent)
- (예정) Lighthouse CI — main 브랜치 PR 게이트

## 외부 의존 서비스

| 서비스 | 용도 | 결합도 |
|---|---|---|
| Vercel | 호스팅·CI·OG 이미지 | 강 (배포 핵심) |
| Namecheap | 도메인 등록 (milkfolio.space) | 약 (DNS만) |
| `hjee1/casting-agent` (외부 리포) | GitHub Actions → `agent/data.html` 자동 푸시 | 약 (정적 파일 푸시) |
| Google Fonts | 폰트 제공 | 중 (CDN, next/font가 self-host로 캐싱) |

## 개발 컨벤션

- **Server Components 기본**: 모든 페이지는 Server Component, 인터랙션이 필요한 부분만 `"use client"` 자식으로 분리
- **CSS Modules + Tailwind 하이브리드**: 페르소나별 시그니처는 CSS Modules, 유틸은 Tailwind
- **Pure functions**: `lib/` 안의 유틸은 사이드이펙트 0
- **타입 우선**: any 금지, unknown은 narrowing 후 사용

## SPEC-DEV-REDESIGN-001 기술 결정 요약

| 결정 | 채택안 | 이유 |
|---|---|---|
| 3D 라이브러리 | Three.js + @react-three/fiber | React 선언적 모델, 생태계 광범위 |
| 애니메이션 | CSS keyframes/transition (Motion 미채택 — 미사용 dep 제거) | 현 인터랙션 범위에 충분, 번들 0KB |
| 인터랙티브 데모 | 사전 녹화 + 추상 아트 | LLM API 호출 회피 (비용·키 관리 부담 회피) |
| 폰트 로딩 | next/font (self-host) | LCP 최적화, FOUT 회피 |
| 빌드 분리 | /dev 라우트 코드 스플릿 | 다른 페르소나 번들에 영향 없음 |
