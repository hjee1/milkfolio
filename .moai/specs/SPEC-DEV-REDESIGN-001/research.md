# Research — SPEC-DEV-REDESIGN-001

깊이 있는 사전 분석. SPEC 계획 전 의사 결정의 근거.

---

## 1. 현재 상태 분석 (Brownfield)

### `/dev` 페이지 코드 인벤토리

| 파일 | 라인 수 | 역할 | 클라이언트 JS |
|---|---|---|---|
| `app/dev/page.tsx` | 350 | Pure Server Component, 5섹션 정적 마크업 | 0 |
| `app/dev/page.module.css` | ~12,000자 | cyan #38d9ff 액센트, glassmorphism, 그리드 hero | — |
| `app/dev/layout.tsx` | ~30 | 영어 메타, dev 테마 | 0 |
| `e2e/dev.spec.ts` | (확인 필요) | Playwright 회귀 테스트 | — |

### 섹션 구조 (현재)

1. **Nav** (인라인, 글래스모피즘) — `← milkfolio` + 4개 앵커 링크
2. **Hero** — 정적 그리드 배경 + 큰 이름 `Hyunwoo Jee.` + 칩(Airflow/Databricks/Snowflake/Cognite) + `Explore` CTA
3. **About (01)** — 4년차 Data Engineer 자기소개 + 4개 info 카드 (4+ Years / 3 Languages / B.S. / ∞ Pipelines)
4. **Stack (02)** — 6장 카드 (Orchestration/Data Platform/Industrial IoT/Languages/Infrastructure/Cloud)
5. **Experience (03)** — Hanwha System 타임라인 + IIT 학력
6. **Contact (04)** — 이메일·LinkedIn

### 진단

| 영역 | 현재 점수 | 목표 점수 | 갭 |
|---|---|---|---|
| 시각적 임팩트 | 4/10 | 9/10 | 정적 → 시네마틱 WebGL |
| 인터랙션 깊이 | 1/10 | 8/10 | 0 → 인터랙티브 라보 섹션 |
| 정체성 정확성 | 3/10 (outdated) | 10/10 | Data Engineer → AI Technical Engineer |
| 콘텐츠 밀도 | 5/10 | 7/10 | 일반 자기소개 → 매니페스토·라보·craft |
| 기술적 craft 시연 | 2/10 | 9/10 | 없음 → 페이지 자체가 craft 증거 |
| 기억에 남는 정도 | 3/10 | 9/10 | 평범한 포트폴리오 → "와 이거 직접 만들었다고?" |

### 보존해야 하는 자산

- **/dev 라우트 URL** (`/dev`) — 외부 링크·SEO 유지
- **cyan 액센트 컬러 시스템** (#38d9ff) — 페르소나 시그니처
- **다른 페르소나(/actor, /designer, /agent)와의 분리** — 공유 컴포넌트로 회귀 금지

---

## 2. 사용자 의도 재해석

> "milkefolio.space/dev를 풍부하고 더 화려하게 만들고 싶어. 누가 봐도 와, 이사람은 진짜 이런걸 만들었다고? 놀랄만하게."

핵심 키워드:
- **풍부함 (richness)** — 콘텐츠 밀도, 디테일의 깊이
- **화려함 (spectacle)** — 시각적 임팩트, 즉각적 wow
- **놀라움 (astonishment)** — "직접 만들었다고?" 반응

추가 제약 (사용자 명시):
- 콘텐츠 0% 공개 (회사·개인 프로젝트 모두)
- 직업 완벽 분리 (배우 정체성 bridge 제외)
- AI Technical Engineer 정체성 반영 (이전 Data Platform Engineer 폐기)

### Narrative 해결책: "The Portfolio IS the Proof"

콘텐츠 0% 공개 + 화려함 풀파워 = 사이트 자체가 작업물. 외부 의존 없이 페이지의 craft 자체로 실력 증명. 이는 약점이 아닌 confident 입장.

**핵심 메시지**: "내가 뭘 만들었는지 자랑하지 않겠다. 지금 이 페이지가 내가 뭘 만들 수 있는지 보여준다."

---

## 3. 기술 의사결정 분석

### 3.1 WebGL 라이브러리 선택

| 옵션 | 장점 | 단점 | 채택 |
|---|---|---|---|
| **Three.js + @react-three/fiber** | React 선언적 모델, 생태계 광범위, Drei 헬퍼 | 번들 ~200KB | ✅ |
| Babylon.js | 게임 엔진급 기능 | 오버킬, 번들 더 큼 | ✗ |
| PixiJS | 2D 가속 우수 | 3D 약함, 시네마틱 부적합 | ✗ |
| OGL | 초경량 (~10KB) | API 저수준, React 통합 부족 | ✗ |
| Pure WebGL | 100% 컨트롤 | 개발 공수 매우 큼 | ✗ |

**채택**: Three.js + @react-three/fiber + @react-three/drei (선택적). React 19 + Next.js 16과의 호환성 확인됨.

### 3.2 스크롤·제스처 애니메이션

| 옵션 | 장점 | 단점 | 채택 |
|---|---|---|---|
| **Motion (구 framer-motion)** | variants/scroll/gesture API 풍부, R3F 통합 가능 | 번들 ~50KB | ✅ |
| GSAP + ScrollTrigger | 업계 표준, 강력 | 상용 라이선스 (Club GreenSock) 필요할 수 있음 | ✗ |
| Motion One | 초경량 (~5KB) | React 통합 약함, 고급 패턴 직접 작성 | ✗ |
| 순수 CSS scroll-driven anim | 0KB JS | 브라우저 호환성 (Safari 미흡, 2026 기준 일부 OK) | (보완용) |

**채택**: Motion + CSS scroll-driven animations 보완 (modern Safari 지원 범위 내).

### 3.3 Lab 섹션의 "AI 데모" 처리

사용자 결정: **사전 녹화 + 추상 아트** (실시간 LLM API 호출 회피).

| 데모 아이디어 | 구현 방식 | 위험 |
|---|---|---|
| "Agent thinking" 시퀀스 | 사전 작성된 토큰 스트림 데이터를 타이프라이터처럼 재생 | 키 관리 ✗, 비용 ✗, 안전 ✓ |
| 인터랙티브 DAG 토폴로지 | R3F로 노드·엣지 렌더링, 드래그로 재구성 | 구현 복잡도 ↑ |
| Compound 위젯 조합 | 작은 인터랙티브 카드 3-4개가 합쳐져 더 큰 결과 | "compound engineering" 정신 시각화 |
| 파티클 응답성 | 마우스 위치에 따라 파티클 흐름 변형 (장식적) | 성능 ↓ 위험 |

### 3.4 메타 텔레메트리 (Craft 섹션)

페이지가 자신의 빌드·런타임 정보를 라이브로 표시:

- **빌드 시간**: 빌드 시 `process.env.BUILD_TIME` 주입 (next.config.ts)
- **커밋 해시**: 빌드 시 `process.env.VERCEL_GIT_COMMIT_SHA` 주입
- **번들 크기**: 사전 측정 후 정적 표시 또는 빌드 시 주입
- **렌더 FPS**: Client Component에서 `requestAnimationFrame` 측정
- **폰트 로딩 상태**: `document.fonts.ready`
- **Lighthouse 점수**: 사전 측정 후 정적 표시

→ 데이터 엔지니어의 "관측 가능성(observability)" 정신을 craft에 적용. 페이지 자체가 모니터링 대상.

---

## 4. 6섹션 상세 설계 (Section 5 Identity Bridge 제외 확정)

### Section 0: Cinematic Hero

**목표**: 진입 즉시 "와"

**구성**:
- 풀-뷰포트 (100vh) Canvas with R3F
- 시그니처 비주얼: **뉴럴 네트워크풍 파티클 + DAG 토폴로지의 하이브리드** — 노드들이 서로 연결되고 데이터가 흐르는 듯한 추상화
- 마우스 위치에 반응 (subtle, 과하지 않게)
- 큰 타이포: `Hyunwoo Jee.` + 서브타이틀 `AI Technical Engineer`
- 사이드 corner: 라이브 시스템 보드 (commit hash, build age, fps, font load)
- 스크롤 힌트

**기술**:
- R3F Canvas, shaderMaterial 또는 instancedMesh
- `useFrame` 훅으로 애니메이션 루프
- 모바일에서는 파티클 수 감소

### Section 1: Manifesto / Now

**목표**: 정체성 declaration

**구성**:
- 매거진 풍 큰 타이포 ("I'm working at the frontline of AI engineering")
- 현재 활동 리스트 (한화시스템 AI기술팀, Claude Code/MoAI 표준화, Mistral AI 협업 등) — 추상화·일반화 (회사 내부 정보 노출 없음)
- 스크롤 페이드인 (Motion variants)
- 모노스페이스 액센트 (`>` prompt 스타일)

### Section 2: Lab — Interactive Demos

**목표**: 페이지 자체가 craft 시연. 가장 wow한 섹션.

**구성**:
- 3-4개의 인터랙티브 카드
  - **a. Agent Thinking Replay**: 사전 작성된 "에이전트가 문제 풀이를 진행하는" 스트림을 클릭으로 재생
  - **b. Compound Composer**: 작은 위젯 3개를 사용자가 조합하면 4번째 결과가 동적으로 생성됨
  - **c. DAG Explorer**: 작은 데이터 파이프라인 토폴로지를 마우스로 변형
  - (선택) **d. Particle Conductor**: 마우스 따라 흐름 변형하는 입자 시뮬레이션
- 각 카드는 독립적 컴포넌트, 코드 스플릿
- "이 데모들은 추상화된 컨셉입니다 — 실제 회사 작업물이 아닙니다" 같은 작은 disclosure (선택적)

### Section 3: Stack & Approach

**목표**: 새 정체성의 기술 스택 시각화

**구성**:
- 카테고리:
  - **Harness & Orchestration**: Claude Code, MoAI, Compound Engineering
  - **AI Models & APIs**: Anthropic Claude, Mistral, (협업 가능 범위)
  - **Engineering**: TypeScript, Next.js, React 19, Three.js
  - **Foundations**: Python, SQL (이전 경험 유지)
- 카드 형태 또는 노드 그래프 (Lab과 차별화)

### Section 4: Craft / This Page

**목표**: 메타 자기참조 — "이 페이지 자체의 디테일을 전시"

**구성**:
- 라이브 데이터:
  - 빌드 해시 + 빌드 시간
  - 현재 렌더 FPS
  - 폰트 로드 상태
  - 번들 크기 (사전 측정)
  - Lighthouse 점수 (사전 측정)
- 아키텍처 요약 (Next.js 16 / React 19 / R3F / etc.)
- 모노스페이스 폰트 (Fira Code) 활용

### Section 5: Contact

**목표**: 미니멀하고 자신감 있는 클로징

**구성**:
- 큰 타이포 "Let's build something real."
- 이메일·LinkedIn 두 줄
- (선택) 가용성 상태 (예: "Open to AI engineering collaborations")

---

## 5. 위험 분석

| 위험 | 확률 | 영향 | 완화책 |
|---|---|---|---|
| **WebGL 성능 저하 (모바일)** | 중 | 고 | 디바이스 감지 → 파티클 수 감소, 또는 정적 SVG fallback |
| **번들 크기 폭증** | 중 | 중 | /dev 라우트 코드 스플릿, dynamic import, R3F 사용량 최소화 |
| **접근성 회귀** | 중 | 고 | 모든 인터랙션에 키보드 접근 + `prefers-reduced-motion` 존중 |
| **Lighthouse Performance 하락** | 고 | 중 | LCP 최적화 (Hero 텍스트 우선 렌더), Three.js lazy 로드 |
| **R3F + React 19 + Next 16 호환성** | 저 | 고 | 사전 PoC + Context7로 최신 docs 확인 |
| **Lab 데모가 "그냥 가짜" 인상** | 중 | 고 | 정교한 모션 + 의미 있는 결과 + 톤 가이드 (oversell 금지) |
| **Manifesto 톤이 오만함** | 저 | 중 | 사용자 검수 필수, "겸손한 자신감" 가이드 적용 |
| **외부 라이브러리 버전 충돌** | 저 | 중 | pnpm lockfile, peer dependency 검증 |

---

## 6. 참고 패턴 (Inspirations)

> *외부 URL을 새로 발명하지 않음 — 사용자가 이미 알고 있는 사이트 카테고리 레퍼런스만.*

- **Linear (linear.app)** — 매거진풍 타이포 + 절제된 모션
- **Vercel (vercel.com)** — 시네마틱 hero + 메타 텔레메트리 감각
- **Anthropic (anthropic.com)** — AI craft + 절제
- **Bruno Simon / Awwwards Top picks** — R3F 시네마틱 reference
- **Naval Ravikant (nav.al)** — Mononymous confident statement
- **Hosoi Hideto의 일본 디자이너 사이트** — craft + 자기참조

(실제 구현 시 직접 표절 없이 정신만 차용)

---

## 7. 의사결정 추적

| 결정 | 채택 | 근거 |
|---|---|---|
| 페르소나 정체성 | AI Technical Engineer | 사용자 명시 |
| Narrative | "Portfolio IS the Proof" | 콘텐츠 0% 공개 제약의 정당화 |
| 섹션 수 | 6 (배우 bridge 제외) | 사용자 명시 (직업 완벽 분리) |
| WebGL | Three.js + @react-three/fiber | 생태계, React 통합, 검증된 호환성 |
| 애니메이션 | Motion (framer-motion) | API 풍부, React 19 호환 |
| Lab 데모 | 사전 녹화 + 추상 | 사용자 명시 (API 호출 회피) |
| Lottie 도입 | 옵션 (필요시) | 풀 파워 예산 허용 |
| 컬러 시스템 | cyan #38d9ff 유지 + 보조 톤 추가 | 페르소나 시그니처 보존 |
| 라우트 | `/dev` 동일 유지 | SEO/외부 링크 유지 |

---

## 8. 다음 단계

1. **spec.md** — 6섹션 EARS 요구사항 명세
2. **plan.md** — 구현 단계, 컴포넌트 분리, 위험 완화 액션
3. **acceptance.md** — Given/When/Then 시나리오, 성능·접근성 기준
4. **spec-compact.md** — Run phase용 압축본

이후 사용자 승인 → `/moai run SPEC-DEV-REDESIGN-001` 으로 구현 진입.
