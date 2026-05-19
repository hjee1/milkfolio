---
id: SPEC-DEV-REDESIGN-001
version: 1.0.0
status: draft
---

# SPEC-DEV-REDESIGN-001 (Compact) — /dev 풀파워 재설계

## EARS Requirements

### Ubiquitous
- **REQ-DEV-U-001**: `/dev` 페이지는 6개 섹션(Hero / Manifesto / Lab / Stack / Craft / Contact)으로 구성된다.
- **REQ-DEV-U-002**: 모든 텍스트는 영어로 작성. 사용자 한글 이름(지현우)은 한 곳에 예외 허용.
- **REQ-DEV-U-003**: 사용자는 "AI Technical Engineer"로 소개된다. "Data Engineer", "Data Platform Engineer" 등장 금지.
- **REQ-DEV-U-004**: 회사 프로젝트 디테일, 한화시스템 내부 정보, 식별 가능 개인 프로젝트 콘텐츠 노출 금지.
- **REQ-DEV-U-005**: cyan 액센트(#38d9ff)를 시그니처로 유지, 보조 톤은 동일 패밀리 내.
- **REQ-DEV-U-006**: Next.js 16 Server Component 시작, 인터랙션 필요 부분만 Client Component.

### Event-Driven
- **REQ-DEV-E-001**: WHEN 페이지 진입 시 Hero WebGL 시각화가 200ms 이내 첫 프레임 표시.
- **REQ-DEV-E-002**: WHEN 스크롤 시작 시 각 섹션이 Motion variants로 페이드인 + 약한 translate 진입.
- **REQ-DEV-E-003**: WHEN Lab 카드 클릭/키보드 활성화 시 사전 녹화된 시퀀스 즉시 재생.
- **REQ-DEV-E-004**: WHEN Hero 영역에서 마우스 이동 시 WebGL 파티클이 미세하게 반응.
- **REQ-DEV-E-005**: WHEN 페이지 로드 완료 시 Craft 섹션이 실측 데이터(FPS, 폰트) 클라이언트 사이드 표시.

### State-Driven
- **REQ-DEV-S-001**: WHILE `prefers-reduced-motion: reduce` 활성 시 모든 자동 애니메이션 비활성, WebGL은 정적 첫 프레임만.
- **REQ-DEV-S-002**: WHILE 뷰포트 < 768px 시 파티클 50% 이하, Lab 데모 단순화.
- **REQ-DEV-S-003**: WHILE 키보드 only 탐색 시 모든 인터랙티브 요소 Tab 순회 + 포커스 링 명확.

### Optional
- **REQ-DEV-O-001**: WHERE 빌드 env(VERCEL_GIT_COMMIT_SHA, BUILD_TIME) 제공 시 Craft에 라이브 표시. 미제공 시 fallback.
- **REQ-DEV-O-002**: WHERE WebGL2 미지원 시 Hero는 정적 SVG/CSS gradient fallback.
- **REQ-DEV-O-003**: WHERE Lottie 채택 시 dynamic import로 초기 번들 제외.

### Unwanted
- **REQ-DEV-N-001**: 외부 LLM/AI API(Anthropic, OpenAI, Mistral 등) 런타임 호출 금지.
- **REQ-DEV-N-002**: third-party 분석 스크립트 신규 추가 금지.
- **REQ-DEV-N-003**: 회원가입·구독·뉴스레터 요청 금지.
- **REQ-DEV-N-004**: `/actor` 또는 서해우 정체성 명시적 링크/언급 금지 ("직업 완벽 분리").
- **REQ-DEV-N-005**: Lighthouse Performance 점수 80 미만 금지.

---

## Acceptance Criteria (Given/When/Then)

### A1. 새 정체성 명확 표시
- Given 사용자가 데스크톱으로 /dev 진입 후 로드 완료 시
- When 페이지 콘텐츠를 스캔하면
- Then "Hyunwoo Jee." + "AI Technical Engineer" 표시 + "Data Engineer" 문자열 0건 + cyan 시그니처 인지

### A2. 6섹션 모두 렌더
- Given /dev 진입 후 로드 완료
- When DOM 검사 시
- Then Hero/Manifesto/Lab/Stack/Craft/Contact 6개 섹션 존재 + 스크롤 가능

### B1. Lab 카드 클릭 활성화
- Given Lab 섹션 도달
- When 첫 카드 재생 버튼 클릭 시
- Then 사전 녹화 시퀀스 재생 + 일시정지 버튼 표시 + 외부 API 호출 0건

### B2. 키보드 활성화
- Given 키보드 only 사용
- When Tab으로 Lab 컨트롤 도달 후 Enter/Space
- Then 마우스 클릭과 동일 활성화 + 포커스 링 명확

### B3. 외부 LLM API 비호출
- Given 어떤 Lab 데모 활성화든
- When 데모 재생/인터랙션 중
- Then api.anthropic.com / api.openai.com / api.mistral.ai 등 호출 0건

### C1. prefers-reduced-motion 존중
- Given OS prefers-reduced-motion: reduce 활성
- When /dev 진입
- Then Hero Canvas 정적 + Motion 비활성 + Lab 자동재생 정지

### C2. 키보드 only 완전 탐색
- Given 키보드 only 사용
- When Tab 반복
- Then 모든 인터랙티브 요소 도달 + 포커스 링 명확

### C3. WCAG AA 준수
- Given 페이지 완전 렌더 후
- When axe/Lighthouse 감사
- Then Accessibility >= 95 + 콘트라스트 위반 0 + aria/alt 누락 0

### D1. Lighthouse 모바일 Performance >= 80
- Given Vercel 배포 상태
- When Lighthouse 모바일 시뮬레이션
- Then Performance >= 80 + LCP < 2.5s + CLS < 0.1

### D2. 초기 JS gzip < 250KB
- Given 프로덕션 빌드 완료
- When /dev 라우트 초기 JS 측정
- Then gzip < 250KB

### D3. 60 FPS Hero 렌더 (데스크톱)
- Given 데스크톱 Chrome에서 Hero visible
- When useFrame 루프 측정
- Then 평균 >= 55 FPS

### E1. 모바일 320px 그레이스풀
- Given 뷰포트 320px
- When /dev 진입
- Then 가로 스크롤 없음 + 텍스트 가독성 + Lab 세로 스택 + 파티클 50% 이하

### F1. WebGL2 미지원 fallback
- Given WebGL2 비활성 환경
- When /dev 진입
- Then Hero가 SVG/CSS gradient fallback + 페이지 정상 동작 + Lab 정적 변형

### G1. 한화시스템 내부 정보 미노출
- Given 페이지 탐색 시
- When 모든 텍스트 스캔
- Then 내부 프로젝트명/코드명, 클라이언트 이름, 아키텍처 디테일, 비공개 파트너 상세 정보 0건

### G2. 배우 정체성 cross-link 부재
- Given 페이지 렌더 상태
- When 모든 a/Link 스캔
- Then `/actor` 링크 0건 + "서해우/Seo Hae-woo/Terry(배우 맥락)" 0건

### H1. Craft 빌드 메타 표시
- Given Vercel 프로덕션 배포
- When 사용자가 Craft 섹션 도달
- Then 빌드 SHA(7자) + 빌드 경과 시간 표시 + 로컬 dev에서 fallback 정상

### H2. 라이브 FPS 측정
- Given Craft 섹션 도달 후 1초 이상 머무름
- When 표시된 FPS 관찰
- Then 합리적 범위(30~120) + 정기적 업데이트(정적값 아님)

### J1. 다른 페르소나 회귀 없음
- Given SPEC-DEV-REDESIGN-001 변경 후
- When /actor, /designer, /agent 방문
- Then 변경 전과 동일 동작 (Playwright e2e 전 spec 통과)

### K1. 모든 품질 게이트 통과
- Given PR 머지 전 CI 실행
- When 게이트 확인
- Then typecheck/lint/e2e/Lighthouse(>=80) 모두 통과

---

## Files to Modify

### Modify
- `app/dev/page.tsx` — 전면 재작성, Server Component 골격 + 6섹션 조합
- `app/dev/page.module.css` — 액센트 토큰 확장 (cyan 유지 + 보조 톤)
- `app/dev/layout.tsx` — 메타 (직함 업데이트, OG 이미지 옵션)
- `next.config.ts` — env 주입 추가 (BUILD_TIME, BUILD_SHA)
- `e2e/dev.spec.ts` — 회귀 확장 (6섹션, 키보드, reduced-motion)
- `package.json` + `pnpm-lock.yaml` — 신규 의존성

### New
- `app/dev/_components/Hero.tsx` + `Hero.module.css`
- `app/dev/_components/Manifesto.tsx` + `Manifesto.module.css`
- `app/dev/_components/Lab.tsx`
- `app/dev/_components/LabCard.tsx` (dynamic import 컨테이너)
- `app/dev/_components/lab/agent-replay.json` (사전 녹화 데이터)
- `app/dev/_components/lab/AgentReplay.tsx`
- `app/dev/_components/lab/CompoundComposer.tsx`
- `app/dev/_components/lab/DAGExplorer.tsx`
- `app/dev/_components/Stack.tsx` + `Stack.module.css`
- `app/dev/_components/Craft.tsx` + `Craft.module.css`
- `app/dev/_components/Contact.tsx` + `Contact.module.css`
- `app/dev/_components/shared/tokens.ts`
- `app/dev/_components/shared/usePrefersReducedMotion.ts`
- `app/dev/_components/shared/useDeviceTier.ts`
- `app/dev/_components/shared/useBuildInfo.ts`
- `app/dev/_components/shared/useFPS.ts`
- `app/dev/_components/shared/useFontStatus.ts`

### Remove
- `app/dev/page.tsx`의 기존 5섹션 마크업 (재작성 시 자연 삭제)
- 기존 `<Link href="/actor">서해우</Link>` cross-link

---

## Exclusions (What NOT to Build)

1. 실시간 LLM API 호출 기능
2. `/dev` 서브 라우트 (`/dev/lab`, `/dev/projects` 등)
3. 백엔드 / Server Actions on `/dev`
4. 블로그 / CMS 통합
5. 공유 컴포넌트(`SiteNav`, `SiteFooter`) 변경
6. 다른 페르소나(/actor, /designer, /agent) 변경
7. 배우 정체성으로의 cross-link
8. 회사 내부 정보 / 실제 작업물 디테일 노출
9. 계정 / 댓글 / 뉴스레터 시스템
10. 다국어 (i18n) — /dev는 영어 고정
