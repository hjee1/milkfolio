# Plan — SPEC-DEV-REDESIGN-001

`/dev` 풀파워 재설계의 구현 계획. spec.md의 EARS 요구사항을 작업 단위로 분해.

---

## 0. 사전 준비 (Phase 0)

### 0.1 의존성 호환성 검증 (블로킹)
- Context7로 다음 docs 최신본 확인:
  - `vercel/next.js` (App Router + React 19 + Server/Client 분리 패턴)
  - `pmndrs/react-three-fiber` (React 19 호환 버전 — 9.x 라인)
  - `pmndrs/drei` (R3F 9.x와 호환되는 drei 버전)
  - `framer/motion` 또는 `motion` (구 framer-motion, React 19 호환)
- `pnpm add three @react-three/fiber @react-three/drei motion` 시범 설치 후 `pnpm typecheck` 통과 확인
- React 19 RC 호환성 이슈 발견 시 → 사용자에게 보고, 대체안 결정

### 0.2 빌드 시 환경 변수 주입 설정
- `next.config.ts`에 다음 주입 추가:
  ```ts
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_SHA: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  }
  ```
- 로컬 dev 환경 fallback: `'local-dev'`
- `@MX:ANCHOR` 태그로 표시

### 0.3 디렉터리 구조 셋업
```
app/dev/
├── layout.tsx (메타 업데이트)
├── page.tsx (서버 컴포넌트, 6섹션 조합)
├── page.module.css (액센트 토큰 확장)
└── _components/
    ├── Hero.tsx + Hero.module.css (Client, R3F)
    ├── Manifesto.tsx + Manifesto.module.css (Client, Motion)
    ├── Lab.tsx (Server) + LabCard.tsx (Client, dynamic)
    ├── Stack.tsx + Stack.module.css (Server or Client)
    ├── Craft.tsx + Craft.module.css (Client, FPS 측정)
    ├── Contact.tsx + Contact.module.css (Server)
    └── shared/
        ├── tokens.ts (cyan 액센트 + 보조 톤 상수)
        ├── usePrefersReducedMotion.ts
        └── useDeviceTier.ts (모바일 감지)
```

---

## 1. Phase 1 — Hero 섹션 (가장 큰 위험, 가장 큰 임팩트)

### 1.1 R3F 시그니처 비주얼 구현
- `Hero.tsx`: Client Component, `Canvas` 풀-뷰포트 (100vh)
- 시그니처 비주얼 후보 (구현 시 1개 선택):
  - **A. 인스턴스드 파티클 + 연결선** — `instancedMesh`로 ~2000 노드, 거리 기반 라인 연결 (DAG 느낌)
  - **B. 셰이더 노이즈 필드** — `shaderMaterial`로 GPU 기반 흐름 (시네마틱)
  - **C. 노드 그래프** — 미니어처 DAG (해석 가능한 의미)
- **권장**: A + B 결합 (파티클 위에 셰이더 그라데이션 오버레이)
- `useFrame` 콜백에 `@MX:WARN` 태그 부착
- 마우스 위치 감지 → 파티클 흐름 미세 변형 (`useThree` + `Vector2`)

### 1.2 라이브 시스템 보드 (Hero 사이드)
- 좌측 또는 우측 corner에 모노스페이스 라이브 텍스트:
  - `> commit: a1b2c3d`
  - `> deployed: 2h ago`
  - `> fps: 60`
  - `> fonts: 3/3 loaded`
- `Craft.tsx`와 데이터 공유를 위해 `useBuildInfo()` 훅 또는 Context 도입

### 1.3 타이포그래피 오버레이
- 큰 이름 `Hyunwoo Jee.` (Space Grotesk Display)
- 서브타이틀 `AI Technical Engineer` (Fira Code monospace + cyan)
- (선택) 한글 `지현우` 작은 표기 1회

### 1.4 모바일·접근성 분기
- 뷰포트 < 768px → 파티클 수 50% 감소 (`useDeviceTier`)
- `prefers-reduced-motion` → 정적 첫 프레임만 표시, `useFrame` 비활성화
- WebGL2 미지원 → CSS gradient + SVG 노드 도식 fallback

### 1.5 LCP 최적화
- 텍스트 오버레이는 SSR로 우선 렌더 (Server Component 부모에서 children으로 전달)
- Canvas는 `next/dynamic`으로 `ssr: false` + skeleton placeholder
- `priority` 폰트 로딩 (Space Grotesk)

---

## 2. Phase 2 — Manifesto / Now 섹션

### 2.1 매거진풍 타이포 구성
- 큰 statement (예: "Building at the frontier where AI engineering meets human craft.")
- 서브 텍스트 — 현재 활동 추상화:
  - "Standardizing AI engineering workflows at an enterprise scale"
  - "Research at the frontier of Claude Code, Harness Engineering, and Compound Engineering"
  - "Collaborating with international AI partners on shared craft"
- 톤 가이드: "겸손한 자신감" — oversell ✗, 사실 기반 + 큰 그림 ✓

### 2.2 Motion 스크롤 진입
- `motion` variants + `useInView` 또는 `whileInView`
- `prefers-reduced-motion` 분기는 motion 자체에서 지원

### 2.3 모노스페이스 액센트
- 짧은 코드/프롬프트 풍 라인 — 시그니처 (예: `> active branch: ai-tech-team/main`)

---

## 3. Phase 3 — Lab (Interactive Demos) — 가장 wow한 섹션

### 3.1 카드 그리드 구성
- 3 카드 (PoC 기준), 데스크톱 가로 배치 / 모바일 세로 stack
- 각 카드는 `next/dynamic({ ssr: false })` 로드 → 초기 번들 최소화

### 3.2 카드 A: Agent Thinking Replay
- 사전 작성된 토큰 스트림 JSON (`app/dev/_components/lab/agent-replay.json`)
- 타이프라이터 효과 (rAF 기반 또는 `useEffect` + `setTimeout` chain)
- 일시정지/재생 컨트롤
- 키보드: `Space`로 재생 토글

### 3.3 카드 B: Compound Composer
- 3개의 작은 토글/슬라이더 위젯
- 사용자가 위젯을 조작하면 4번째 영역에 합성 결과가 시각화됨 (작은 SVG 또는 Canvas)
- "compound engineering" 정신: 작은 도구의 조합이 더 큰 결과
- 키보드: `Tab` + 화살표

### 3.4 카드 C: DAG Explorer
- 미니어처 DAG (5-7 노드, 추상화된 라벨: "ingest", "transform", "publish" 등)
- R3F 또는 SVG 기반
- 마우스 드래그로 노드 이동, 엣지가 따라옴
- 키보드: 노드 선택 + 화살표로 이동

### 3.5 (선택) 카드 D: Particle Conductor
- Hero의 파티클을 작은 카드 버전으로 재현
- 마우스 위치에 따라 파티클 흐름 변형
- 위 3개로 충분히 풍부하면 D는 생략 (스코프 컨트롤)

---

## 4. Phase 4 — Stack & Approach

### 4.1 카테고리 재정의
| 카테고리 | 항목 |
|---|---|
| Harness & Orchestration | Claude Code, MoAI, Compound Engineering |
| AI Models & APIs | Anthropic Claude, Mistral (등) |
| Engineering | TypeScript, Next.js 16, React 19, Three.js, Motion |
| Foundations | Python, SQL |

### 4.2 시각화 방식 (결정 보류, 구현 시 선택)
- **옵션 A**: 카드 그리드 (현재와 유사하지만 새 카테고리) — 안전
- **옵션 B**: R3F 노드 그래프 — Lab과 차별화 필요 (오버랩 위험)
- **권장 A** — Lab이 이미 인터랙티브이므로 Stack은 정적·정보 밀도 우선

### 4.3 호버 시 디테일 확장 (선택)
- 카드 호버 시 짧은 설명 슬라이드인 (Motion variants)

---

## 5. Phase 5 — Craft / This Page (메타 자기참조)

### 5.1 라이브 데이터 표시
- `useBuildInfo()` — Phase 1과 공유
- `useFPS()` — `requestAnimationFrame` + 평균 60프레임
- `useFontStatus()` — `document.fonts.ready` Promise
- `useBundleSize()` — 빌드 시 사전 측정값 정적 import

### 5.2 시각 구성
- 모노스페이스 폰트 (Fira Code)
- 터미널 풍 박스 (작은 ASCII 헤더 가능)
- 짧은 stack details 리스트 (라이브러리 + 버전)
- 작은 disclosure: "These metrics are from the page you are looking at right now."

### 5.3 Lighthouse 점수 스냅샷
- 사전 측정 (Vercel 배포 후 한 번) → 정적 표시
- 자동 갱신은 OUT OF SCOPE (별도 작업)

---

## 6. Phase 6 — Contact

### 6.1 카피 업데이트
- 헤딩: "Let's build something real." (기존 유지하되 톤 미세 조정)
- 서브: "Open to AI engineering collaborations and consulting"
- 이메일·LinkedIn 링크 유지

### 6.2 배우 정체성 inline link 제거
- 기존 `<Link href="/actor">서해우</Link>` 부분 삭제 (`REQ-DEV-N-004` 준수)

---

## 7. Phase 7 — 접근성 · 성능 · 회귀

### 7.1 키보드 탐색 검증
- 모든 인터랙티브 요소 `Tab` 순회
- Lab 카드 내 컨트롤 키보드 활성화 가능
- 포커스 링 명확 표시 (`outline` 또는 `box-shadow`)

### 7.2 `prefers-reduced-motion`
- 글로벌 미디어 쿼리 + 컴포넌트별 분기 모두 적용
- R3F Canvas 정지 + Motion 비활성화 + 자동재생 데모는 정적

### 7.3 모바일 그레이스풀 디그레이드
- 320px ~ 768px 그리드 단단 / 1개 컬럼
- Hero 파티클 수 감소
- Lab 카드 가로 스크롤 또는 세로 스택

### 7.4 Lighthouse 사전 측정
- 로컬 Lighthouse CLI 또는 Vercel 미리보기에서 측정
- Performance < 80인 경우 → 번들 분석 + lazy load 강화

### 7.5 Playwright 회귀 (`e2e/dev.spec.ts`)
- 기존 테스트 보존 + 추가:
  - 6섹션 모두 렌더 확인
  - Lab 카드 키보드 활성화
  - `prefers-reduced-motion` 시뮬레이션
  - 모바일 뷰포트 (`devices['iPhone 13']`)

---

## 8. Phase 8 — 마무리 & 배포

### 8.1 PR 미리보기 검토
- Vercel 미리보기 URL 사용자에게 공유
- "와" 반응 확인 (정성적 게이트)
- 톤·카피 수정 필요시 마지막 polish

### 8.2 main 머지
- Conventional commit: `feat(dev): full-power redesign as AI Technical Engineer portfolio (SPEC-DEV-REDESIGN-001)`
- 머지 후 milkfolio.space/dev 프로덕션 반영 확인

### 8.3 사후 관찰
- 모바일에서 발열·배터리 이슈 모니터
- Vercel Analytics에서 LCP·CLS 실 사용자 측정값 확인
- 후속 개선은 별도 작업

---

## 9. 작업 단위 분해 (T-shirt sizing)

| Phase | 사이즈 | 핵심 작업 |
|---|---|---|
| 0. 사전 준비 | S | 의존성 설치, 호환성 검증, 디렉터리 셋업 |
| 1. Hero (R3F) | **XL** | 시그니처 비주얼, 라이브 보드, 모바일·접근성 분기 |
| 2. Manifesto | S | 카피·타이포·Motion 진입 |
| 3. Lab | **L** | 3개 인터랙티브 카드 |
| 4. Stack | M | 카테고리 재정의 + 카드 |
| 5. Craft | M | 라이브 텔레메트리 훅 |
| 6. Contact | XS | 카피 + 링크 정리 |
| 7. 접근성·성능 | M | 키보드·reduced-motion·모바일·Lighthouse·e2e |
| 8. 배포 | S | PR · 미리보기 · 머지 |

**총 추정 노력**: Hero(XL) + Lab(L) 두 섹션이 전체의 60%+ 차지. 나머지는 직선 작업.

---

## 10. 위험·완화 매트릭스

| 위험 | 발생 시 대응 |
|---|---|
| R3F + React 19 호환성 깨짐 | Context7 docs 재확인 → 안정 버전으로 다운그레이드 또는 대체 lib(`ogl`, vanilla Three) |
| Lighthouse < 80 | Hero Canvas lazy load 강화, 파티클 수 감소, Motion variants 단순화 |
| 모바일 발열 | `IntersectionObserver`로 viewport 밖 정지, `useFrame` throttle |
| 번들 폭증 | bundle analyzer 측정 → dynamic import 강화, drei 헬퍼 미사용 |
| Lab 데모가 가짜처럼 보임 | 톤 가이드 적용, 데모 데이터 다듬기, "abstract concept" disclosure |
| Manifesto 톤 오만 | 사용자 검수 게이트, 카피 수정 라운드 |

---

## 11. 의존성 그래프

```
Phase 0 (사전 준비)
   ↓
Phase 1 (Hero) ←──── Phase 5 (Craft, useBuildInfo 공유)
   ↓
Phase 2 (Manifesto)
   ↓
Phase 3 (Lab) ←──── (독립)
   ↓
Phase 4 (Stack) ←──── (독립)
   ↓
Phase 6 (Contact)
   ↓
Phase 7 (접근성·성능·회귀) ←──── 모든 섹션 완료 필요
   ↓
Phase 8 (배포)
```

병렬화 가능: Phase 2 / 3 / 4 / 6은 Phase 1 완료 후 독립적으로 진행 가능.

---

## 12. 구현 참조

- `app/dev/page.tsx` (현재) — 구조·CSS 변수 참고용
- `app/actor/page.tsx` — Motion + 갤러리 패턴 참고
- `app/agent/AgentClient.tsx` — Client Component 분리 패턴 참고
- 외부 reference: SPEC-MIGRATE-NEXT-001 (마이그레이션 이력)

---

## 13. Open Questions (구현 단계에서 결정)

1. Hero 시그니처 비주얼: A(파티클)+B(셰이더) 결합 vs C(노드 그래프) 단독 — PoC 후 결정
2. Stack 시각화: 카드 vs R3F 노드 그래프 — Lab과의 시각적 차별화 우선
3. Lottie 도입 여부: 채택할 단일 모션 자산이 명확해지면 결정, 아니면 생략
4. 한글 `지현우` 표기 위치: Hero vs Contact — 톤 일관성 기준 결정
5. Lighthouse 점수 자동 갱신: 이번 SPEC 범위 외, 후속 작업 별개 SPEC
