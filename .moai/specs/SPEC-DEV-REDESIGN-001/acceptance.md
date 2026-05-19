# Acceptance — SPEC-DEV-REDESIGN-001

Given/When/Then 시나리오로 "완료" 정의. Playwright + Lighthouse + 수동 검증의 조합.

---

## A. 기본 렌더 & 정체성

### A1. 페이지 진입 시 새 정체성이 명확히 보인다

**Given** 사용자가 데스크톱 브라우저로 `/dev`에 진입했고
**When** 페이지가 로드 완료되었을 때
**Then**
- Hero 섹션이 `Hyunwoo Jee.` 이름과 `AI Technical Engineer` 직함을 표시한다
- "Data Engineer", "Data Platform Engineer" 문자열이 페이지 어디에도 등장하지 않는다
- cyan 액센트(#38d9ff) 시그니처가 시각적으로 인지된다

**검증**: Playwright `expect(page.locator('h1')).toContainText('Hyunwoo Jee')` + `expect(page.locator('body')).not.toContainText('Data Engineer')`

### A2. 6개 섹션이 모두 렌더된다

**Given** 사용자가 `/dev`에 진입했고
**When** 페이지가 로드 완료되었을 때
**Then** 다음 6개 섹션이 DOM에 존재하며 viewport에 스크롤 가능하다:
1. Hero (`#top` 또는 첫 `<section>`)
2. Manifesto / Now
3. Lab
4. Stack
5. Craft / This Page
6. Contact

**검증**: Playwright `expect(page.locator('section')).toHaveCount(6)` (또는 명시적 ID로 각각 확인)

---

## B. 인터랙티브 데모 (Lab)

### B1. Lab 카드 마우스 클릭 시 데모가 활성화된다

**Given** 사용자가 Lab 섹션까지 스크롤했고
**When** 사용자가 첫 번째 Lab 카드("Agent Thinking Replay")의 재생 버튼을 클릭하면
**Then**
- 사전 녹화된 토큰 스트림이 타이프라이터처럼 재생되기 시작한다
- 재생 중 일시정지 버튼이 표시된다
- 외부 API 호출(`fetch`, `XMLHttpRequest`)이 발생하지 않는다

**검증**: Playwright `await page.locator('[data-lab-card="agent-replay"] button').click()` + network 인터셉트로 외부 호출 없음 확인

### B2. Lab 카드 키보드 활성화

**Given** 사용자가 키보드만 사용하고
**When** 사용자가 `Tab`으로 Lab 카드의 컨트롤에 도달한 뒤 `Enter` 또는 `Space`를 누르면
**Then**
- 해당 데모가 마우스 클릭과 동일하게 활성화된다
- 포커스 링이 명확히 표시된다

**검증**: Playwright `page.keyboard.press('Tab')` 반복 + `page.keyboard.press('Enter')` 후 상태 확인

### B3. 외부 LLM API 비호출 검증

**Given** 사용자가 어떤 Lab 데모를 활성화하든
**When** 데모가 재생 또는 인터랙션 중일 때
**Then** 네트워크 요청 중 다음 호스트로의 호출은 0건이다:
- `api.anthropic.com`
- `api.openai.com`
- `api.mistral.ai`
- (그 외 LLM API 도메인)

**검증**: Playwright `page.route('**/*', (route, request) => { ... })` 으로 호스트 화이트리스트 검증

---

## C. 접근성

### C1. `prefers-reduced-motion` 존중

**Given** 사용자가 OS 레벨에서 `prefers-reduced-motion: reduce`를 활성화했고
**When** 사용자가 `/dev`에 진입했을 때
**Then**
- Hero의 WebGL Canvas는 정적 첫 프레임만 표시하고 `useFrame` 루프는 실행되지 않는다
- 모든 Motion variants의 자동 진입 애니메이션이 비활성화되어 콘텐츠가 즉시 최종 상태로 표시된다
- Lab 자동 재생 데모는 정적 또는 사용자 트리거 시에만 재생된다

**검증**: Playwright `await page.emulateMedia({ reducedMotion: 'reduce' })` 후 Canvas frame 카운터 또는 transform 변화 측정

### C2. 키보드 only 완전 탐색

**Given** 사용자가 마우스를 사용하지 않고 키보드만 사용할 때
**When** 사용자가 `Tab`을 반복적으로 누르면
**Then**
- 페이지의 모든 인터랙티브 요소(nav 링크, Lab 카드 컨트롤, Contact 링크 등)에 순서대로 도달 가능하다
- 각 요소에서 포커스 링이 명확히 표시된다
- `Skip to content` 링크 또는 nav 우선 순서가 합리적이다

**검증**: Playwright + 수동 검증 (Tab으로 모든 요소 도달 확인)

### C3. WCAG 2.1 AA 준수

**Given** 페이지가 완전히 렌더된 상태에서
**When** axe-core 또는 Lighthouse Accessibility 감사를 실행하면
**Then**
- Accessibility 점수 >= 95
- 컬러 콘트라스트 위반 0건 (cyan #38d9ff와 배경 #070b12의 대비비 검증)
- aria-label / alt 누락 0건
- 헤딩 위계(h1 → h2 → h3) 위반 0건

**검증**: Playwright + `@axe-core/playwright` 또는 Lighthouse CI

---

## D. 성능

### D1. Lighthouse 모바일 Performance >= 80

**Given** 사이트가 Vercel에 배포된 상태에서
**When** Lighthouse 모바일 시뮬레이션 감사를 실행하면
**Then**
- Performance >= 80
- LCP < 2.5s
- CLS < 0.1
- TTI < 4s

**검증**: Lighthouse CLI 또는 Vercel Speed Insights

### D2. 초기 JS 번들 크기 (gzip) < 250KB

**Given** 프로덕션 빌드가 완료된 상태에서
**When** Next.js 빌드 출력의 `/dev` 라우트 초기 JS를 측정하면
**Then** gzip 크기는 250KB 미만이다

**검증**: `pnpm build` 출력 + bundle analyzer

### D3. 60 FPS Hero 렌더 (데스크톱)

**Given** 데스크톱(M1 MacBook 또는 동급) Chrome에서
**When** Hero 섹션이 visible 상태일 때
**Then** Hero Canvas의 `useFrame` 루프가 평균 55 FPS 이상을 유지한다

**검증**: Craft 섹션의 실측 FPS 카운터 또는 Chrome DevTools Performance 탭

---

## E. 반응형

### E1. 모바일 320px 그레이스풀 디그레이드

**Given** 뷰포트 너비가 320px인 모바일에서
**When** `/dev`에 진입했을 때
**Then**
- 가로 스크롤이 발생하지 않는다
- 모든 텍스트가 읽을 수 있는 크기로 표시된다
- Lab 카드들이 세로로 스택되어 가시성을 유지한다
- Hero의 WebGL 파티클 수가 데스크톱 대비 50% 이하로 감소한다

**검증**: Playwright `devices['iPhone SE']` 또는 `viewport: { width: 320, height: 568 }`

### E2. 태블릿·데스크톱 레이아웃

**Given** 뷰포트 너비가 768px / 1024px / 1920px일 때
**When** `/dev`에 진입했을 때
**Then**
- 768px: Lab 카드 1-2열, Stack 카드 2열
- 1024px: Lab 카드 2-3열, Stack 카드 3열
- 1920px+: Lab 카드 3열, Stack 카드 4열, 적절한 max-width 컨테이너

**검증**: Playwright + 스크린샷 비교 또는 수동 검증

---

## F. WebGL Fallback

### F1. WebGL2 미지원 환경 fallback

**Given** WebGL2가 비활성화된 환경에서
**When** `/dev`에 진입했을 때
**Then**
- Hero가 정적 SVG 또는 CSS gradient로 fallback된다
- 페이지가 깨지지 않고 모든 텍스트·인터랙션이 정상 작동한다
- Lab 데모 중 R3F 기반 카드는 정적 변형으로 대체된다

**검증**: Playwright `context.addInitScript` 로 `WebGLRenderingContext` 무력화 후 검증

---

## G. 콘텐츠 정책 준수

### G1. 한화시스템 내부 정보 미노출

**Given** 어떤 사용자가 `/dev`를 탐색하든
**When** 페이지의 모든 텍스트를 스캔하면
**Then** 다음 패턴이 등장하지 않는다:
- 한화시스템 내부 프로젝트명 또는 코드명
- 식별 가능한 클라이언트 이름
- 내부 시스템 아키텍처 디테일
- 비공개 협업 파트너의 상세 정보

**검증**: 수동 카피 리뷰 + 키워드 검색 (regex)

### G2. 배우 정체성으로의 cross-link 부재

**Given** 페이지가 렌더된 상태에서
**When** 모든 `<a>`, `<Link>` 태그를 스캔하면
**Then**
- `/actor` 경로로의 링크가 존재하지 않는다
- "서해우", "Seo Hae-woo", "Terry" (배우 맥락) 단어가 본문에 등장하지 않는다

**검증**: Playwright `expect(page.locator('a[href*="actor"]')).toHaveCount(0)`

---

## H. Craft 메타 텔레메트리 (자기참조)

### H1. 빌드 메타데이터 표시

**Given** 프로덕션 빌드가 Vercel에 배포된 상태에서
**When** 사용자가 Craft 섹션에 도달했을 때
**Then**
- 빌드 SHA(앞 7자)가 표시된다 (예: `commit: a1b2c3d`)
- 빌드 경과 시간이 사람이 읽을 수 있는 형식으로 표시된다 (예: `deployed: 3h ago`)
- 로컬 dev에서는 fallback 문자열(`local-dev` 등)이 표시되어도 페이지가 깨지지 않는다

**검증**: Playwright + Vercel preview URL 검증 / 로컬 빌드에서 fallback 검증

### H2. 라이브 FPS 측정 표시

**Given** 사용자가 Craft 섹션에 도달했을 때
**When** 1초 이상 머무르면
**Then**
- 화면에 표시된 FPS 숫자가 합리적인 범위(30 ~ 120)를 가진다
- 값이 정기적으로 업데이트된다 (정적 값 아님)

**검증**: Playwright + 값 변화 확인 (`expect(value1).not.toEqual(value2)` over time)

---

## I. 수동 정성 검증 (게이트)

### I1. "와" 반응 게이트

**Given** Vercel 미리보기 URL이 준비된 상태에서
**When** 사용자(Hyunwoo)가 직접 미리보기를 본 후
**Then** 사용자가 "와, 직접 만들었다고? 놀랍다"에 준하는 정성적 만족도를 표명한다.

**검증**: 사용자 검수 round, 필요 시 카피·시각 디테일 polish 반복

### I2. 톤 일관성 검증

**Given** 페이지의 모든 카피를 한 번에 읽었을 때
**When** 톤 평가를 하면
**Then**
- 오만하지 않다 ("나는 최고", "the best" 같은 표현 없음)
- 겸손하지만 자신감 있다
- 명확하고 직접적이다 (마케팅 fluff 없음)
- AI Technical Engineer 정체성과 일치한다

**검증**: 사용자 검수

---

## J. 회귀 (다른 페르소나 영향)

### J1. /actor, /designer, /agent 영향 없음

**Given** SPEC-DEV-REDESIGN-001 변경 후
**When** 사용자가 `/actor`, `/designer`, `/agent`를 방문하면
**Then** 각 페이지가 변경 전과 동일하게 작동한다 (스크린샷·인터랙션 회귀 없음)

**검증**: Playwright `e2e/actor.spec.ts`, `designer.spec.ts`, `agent.spec.ts` 통과

### J2. 글로벌 토큰 영향 없음

**Given** 변경 후 `app/globals.css`와 `components/SiteNav`, `components/SiteFooter`가
**When** git diff로 확인되면
**Then** 변경되지 않았다 (또는 SPEC에 명시된 의도적 변경만 있다)

**검증**: PR diff 검토

---

## K. 빌드·배포 게이트

### K1. 모든 품질 게이트 통과

**Given** PR이 main에 머지되기 전
**When** CI 파이프라인이 실행되면
**Then**
- `pnpm typecheck` 통과 (strict, 에러 0)
- `pnpm lint` 통과 (warning 허용 범위 내)
- `pnpm e2e` 통과 (5개 spec 전체)
- Lighthouse CI(있다면) Performance >= 80

### K2. Vercel 미리보기 정상

**Given** PR이 생성된 상태에서
**When** Vercel preview deploy가 완료되면
**Then**
- preview URL이 정상 응답 (HTTP 200)
- /dev 경로가 시각적으로 의도대로 렌더
- 다른 라우트(/, /actor, /designer, /agent) 회귀 없음

---

## L. 완료 체크리스트 (Definition of Done)

- [ ] 모든 A ~ K 시나리오 통과
- [ ] 사용자 정성 검증(I1) 통과
- [ ] PR이 main에 머지됨
- [ ] milkfolio.space/dev 프로덕션 반영 확인
- [ ] sync workflow 실행 → 관련 문서 갱신
