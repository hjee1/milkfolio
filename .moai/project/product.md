# Product — milkfolio

## 한 줄 요약

**milkfolio.space** — Hyunwoo Jee (지현우)의 멀티-아이덴티티 포트폴리오. 한 도메인 아래 세 페르소나(배우 서해우 / AI Technical Engineer / 디자이너)를 분리된 페이지로 호스팅하고, 비공개 캐스팅 에이전트 대시보드를 추가 제공한다.

## 누가 사용하는가 (Audiences)

| 페르소나 | 진입점 | 기대치 |
|---|---|---|
| **캐스팅 디렉터·매니저** | `/actor` | 서해우의 연기 영상·스틸·역할 이력을 빠르게 평가. 한국어, 시네마틱·예술적 분위기. |
| **AI/소프트웨어 기술 채용 담당** | `/dev` | Hyunwoo Jee가 AI Technical Engineer로서 craft·기술력을 가지고 있다는 증거. 영어, 화려하고 기능이 대단한 사이트 자체가 증거물. |
| **디자인 의뢰자** | `/designer` | (예정) 동생의 디자인 포트폴리오. 분리된 비주얼 톤. |
| **인증된 캐스팅 관계자** | `/agent` | 비밀번호 게이트 통과 후 캐스팅 자동화 파이프라인이 만든 데이터 대시보드. |

## 멀티-아이덴티티 원칙

- **세 페르소나는 시각·언어·콘텐츠가 완전히 분리**된다. 공유 CSS·공유 토큰 최소화.
- 메인 랜딩 페이지(`/`)에서만 세 페르소나로 hover-expand 형식으로 라우팅.
- 사용자가 한 페르소나 안에 있을 때는 다른 페르소나의 존재를 강하게 드러내지 않는다 (선택적 직업 분리).

## 콘텐츠 공개 정책 (제약사항)

- **/dev**: 한화시스템 내부 정보·실제 회사 프로젝트·개인 사이드 프로젝트 디테일 **0% 공개**. 사이트의 craft 자체가 유일한 증거.
- **/actor**: (향후 SPEC에서) 공개된 출연작·연기 영상·스틸은 적극 공개.
- **/agent**: 비밀번호 보호 + sessionStorage. 내부 데이터는 SHA-256 게이트 뒤에만.

## 비즈니스 목표 / KPI

- **`/dev` 방문자가 "이 사람이 진짜 이 사이트를 직접 만들었다고?"라고 놀라게 하기** — 풀파워 craft 시연
- **`/actor` 방문자가 "이 배우와 회의를 잡고 싶다"라고 느끼게 하기** — sell 가능한 화려한 포트폴리오
- 두 페르소나 모두 사용자(Hyunwoo)의 *현재 가치*를 즉시 입증해야 함 — 깊은 텍스트보다 즉각적 임팩트 우선

## 페르소나 1: 배우 서해우 (`/actor`)

- 무대명 **서해우** (Seo Hae-woo) / 영문 Terry
- Instagram `@oceanmeetrain`, 180cm / 60kg, 활동 시작 2023
- 주요 출연: Netflix "당신이 죽였다" (2025 단역), 단편 "그래도 사랑이었다" (2025 주연)
- 수요일 18:00 연기 수업 (1개월 단위 변동)

## 페르소나 2: AI Technical Engineer / 개발자 Hyunwoo Jee (`/dev`)

**역할 전환 완료 (이전 → 현재):**

| 이전 (Data Platform Engineer) | 현재 (AI Technical Engineer) |
|---|---|
| Airflow / Databricks / Snowflake / Cognite | Claude Code / Harness Engineering / MoAI / Compound Engineering / superpowers |
| 데이터 파이프라인 개발·운영 | AI 기술 표준화, frontline AI 연구, 실제 프로젝트 투입 공수 축소 |
| 단일 도메인 | Mistral AI 협업 회의, Pooling Forest(AI 외주업체) 협업 평가 등 외부 컬래버 |

- 한화시스템 ~4년차 (소속만 AI기술팀으로 이동)
- B.S. Computer Science, Illinois Institute of Technology (Chicago)
- 언어: 한국어/중국어/영어 native level, 일본어 intermediate

## 페르소나 3: 디자이너 (`/designer`)

- Hyunwoo의 여동생 포트폴리오 예정
- 현재 "Coming Soon" placeholder
- 별도 비주얼 시스템, 부드러운 핑크/라벤더 액센트

## 캐스팅 에이전트 대시보드 (`/agent`)

- SHA-256 client-side 게이트, sessionStorage 인증 유지
- `data.html` 은 외부 `hjee1/casting-agent` GitHub Actions 워크플로우가 자동 푸시
- `innerHTML` 주입 후 `<script>` 재실행을 위한 head appendChild 패턴 필수

## 비기능 요구사항

- **성능**: Vercel 배포 기준 Lighthouse Performance >= 80, LCP < 2.5s (모바일)
- **접근성**: WCAG 2.1 AA 준수, 키보드 네비게이션 완비
- **호환성**: 최신 Chrome/Safari/Firefox (Evergreen). IE 미지원.
- **반응형**: 모바일 우선, 320px ~ 4K
- **SEO**: 페르소나별 OG 메타·구조화 데이터

## 향후 로드맵

1. **SPEC-DEV-REDESIGN-001 (진행 중)** — `/dev` 풀파워 재설계 (AI Technical Engineer 정체성 반영)
2. **(예정)** `/actor` 풀파워 재설계 — 유튜브 연기 영상 카테고리(코미디·감성·자기소개·출연), 스틸컷 갤러리, 역할별 관리
3. **(예정)** `/designer` 동생 포트폴리오 자료 입수 후 구현
4. **(예정)** 공통: favicon, OG 메타, sitemap, back-to-top

## 의도적으로 하지 않는 것 (Non-Goals)

- 블로그/CMS 시스템 구축 — 정적 콘텐츠만
- 댓글·소셜 기능 — 일방향 sell 포트폴리오
- 다국어 자동화 — `/actor`는 한국어, `/dev`는 영어 고정
- 사용자 가입/계정 — `/agent`만 비밀번호, 그것도 단일 공유 키
