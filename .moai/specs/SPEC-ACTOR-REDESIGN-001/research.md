# Research — SPEC-ACTOR-REDESIGN-001

깊이 있는 사전 분석. SPEC 계획 전 의사 결정의 근거.

---

## 1. 현재 상태 분석 (Brownfield)

### `/actor` 페이지 코드 인벤토리

| 파일 | 라인 수 | 역할 | 클라이언트 JS |
|---|---|---|---|
| `app/actor/page.tsx` | 149 | Pure Server Component, 5섹션 정적 마크업 | 0 |
| `app/actor/page.module.css` | 366 | warm gold(#b8a98a) 액센트, 다크 노이르(`--color-bg`), Noto Serif KR + Cormorant | — |
| `app/actor/layout.tsx` | 18 | `data-accent="actor"` wrapper, 한국어 메타 | 0 |
| `app/actor/data.ts` | 134 | PROFILE / FILMOGRAPHY / GALLERY / NAV_LINKS | — |
| `e2e/actor.spec.ts` | (확인 필요, 별도 spec 보존) | Playwright 회귀 테스트 | — |

### 섹션 구조 (현재)

1. **Hero** — 풀-블리드 grayscale `<img>` + 좌측 하단 카피(`Actor` 라벨, `서해우`, `Seo Haeu`) + 우측 하단 scroll dot
2. **About** — sticky portrait + profile table (이름, 생년, 신체, 언어, 학력, 특기, 이메일)
3. **Filmography** — 카테고리(드라마/영화/뮤지컬) 그룹화된 작품 list, Netflix red badge
4. **Gallery** — 3-col 또는 wide/main 변형 grid, hover 시 scale + caption fade-in
5. **Contact** — 중앙 정렬, ✉ / 📷 emoji + 이메일 / 인스타 링크

### 자산 인벤토리 (`public/actor/assets/`)

기보유:
- `hero.jpg` — hero 풀-블리드 portrait
- `profile.jpg` — about 섹션 sticky portrait
- `photo_0..4.png|jpg` — 추가 후보 사진(현재 페이지 미사용)
- `still_acting_1/2.jpg` — academy/연습 still
- `still_netflix_1/2.jpg` — 당신이 죽였다 stills
- `still_bongtu_1/2/3.jpg` — 어느날 엄마가 봉투를 썼다 stills
- `still_nun_1/2.jpg` — 눈 stills

미보유(추후 입수):
- 요즘것들(2024 뮤지컬) 포스터
- 그래도 사랑이었다(2025 단편) still (저화질, 사용자 수급)
- reel 영상(11개: intro 1 + scene 5 + featured 5)

### 진단

| 영역 | 현재 점수 | 목표 점수 | 갭 |
|---|---|---|---|
| 캐스팅 결정 30초 윈도우 | 4/10 | 9/10 | 정적 사진 hero → 영상 reel + character cards |
| 연기 능력 증명 채널 | 1/10 (없음) | 9/10 | 사진만 → reel 11개 (placeholder schema 포함) |
| 인물(character) 단면 | 1/10 (없음) | 8/10 | 작품 list만 → character card flip grid |
| 작품 정보 정확성 | 3/10 (오류 다수) | 10/10 | 6개 작품 정정·확정 |
| 톤 매거진 정렬 | 3/10 (다크 노이르 isolated) | 9/10 | VOGUE Korea editorial 정렬 |
| 페이지 메모리 | 4/10 | 9/10 | "이 배우와 회의를 잡고 싶다" KPI |

### 작품 데이터 오류 목록 (현재 data.ts → 정정)

| 현재 (잘못됨) | 정정 |
|---|---|
| `매장직원 역` / `단역 · 대역` | `점원` / `Netflix · 단역` |
| `눈` / `(무명)` / `주연` (2025) | `눈` / `집주인` / `단편 · 주연` (2023) |
| `어느날 엄마가 봉투를 썼다` / `(무명)` / `단역 · 대역 · 주연` / `웹드라마` | `어느날 엄마가 봉투를 썼다` / `대현` / `단편 · 주연` |
| `삶` / `주연` (2023) | **제거** |
| `오르골` / `단역 · 주연` (2025) | **제거** |
| `오르골들` / `단역 · 주연` (2024) | **제거** |
| (없음) | `너만 있으면` / `준혁` / `단편 · 주연` (2026, placeholder) |
| (없음) | `그래도 사랑이었다` / `국현` / `단편 · 주연` (2025) |
| (없음) | `요즘것들` / `민혁` / `뮤지컬 · 주연` (2024) |

### 보존해야 하는 자산

- **/actor 라우트 URL** (`/actor`) — 외부 링크·SEO 유지
- **`data-accent="actor"` wrapper** — 페르소나 격리
- **한국어 본문 정책** — 캐스팅 시장 언어
- **사진 파일들의 path 형식** — `/actor/assets/...` 유지 (data.ts에서 참조 변경 없이 흡수)
- **`SiteFooter` / 카피라이트** — 액센트 톤만 정렬, 컴포넌트 자체는 보존
- **`/dev`, `/designer`, `/agent`와의 분리** — 공유 컴포넌트로 회귀 금지

---

## 2. 사용자 의도 재해석

> "milkfolio.space/actor를 풀파워 재설계해줘. VOGUE Korea editorial 톤으로. 한국 캐스팅 디렉터가 첫 화면에서 회의를 잡고 싶게 만들어줘."

핵심 키워드:
- **풀파워 (full-power)** — `/dev` SPEC-DEV-REDESIGN-001과 동등한 craft 수준
- **VOGUE Korea editorial** — off-white 매거진 톤, Cormorant + Pretendard, 큰 여백, 큰 사진
- **첫 화면 30초 결정** — Hero + Profile + Reel 첫 episode = 30초 만에 인상 전달

추가 제약 (사용자 명시):
- 실제 reel 영상 파일은 아직 없음 (academy 모놀로그 후처리 대기)
- 회사·개인 정체성 cross-link 금지 (`/dev`와 완벽 분리)
- 작품은 정확히 6편 (디테일 정정 포함)
- character note·hashtag 카피는 별도 인터뷰 round

### Narrative 해결책: "Editorial Magazine + Netflix Reel + Character Cards"

콘텐츠의 두 차원:
- **인상 (impression)**: Hero 영상 + Profile portrait. 시각·분위기.
- **능력 (capability)**: Reel monologue/scene + character cards. 연기 폭·해석 방향.

이 둘을 한 페이지에서 분리·결합. VOGUE 디지털 커버처럼 hero만 다크로 시작, 본문은 off-white로 들어가 매거진 호흡.

**핵심 메시지**: "사진만으로는 배우가 어떤 사람인지 보여줄 수 없다. 이 페이지는 30초 안에 인상과 능력을 동시에 전달한다."

---

## 3. 기술·시각 의사결정 분석

### 3.1 비주얼 톤 선택

| 옵션 | 장점 | 단점 | 채택 |
|---|---|---|---|
| 다크 노이르 (현재) | 시네마틱, 분위기 | 매거진 정렬 부족, 한국 캐스팅 컨벤션과 미스매치 | ✗ |
| **Editorial Magazine (VOGUE 디지털 커버)** | 한국 패션·연기 시장 표준, 큰 여백, 매거진 호흡 | hero가 평범할 수 있음 → Hero만 다크로 격상 | **✅** |
| 풀-다크 + 큰 사진만 | 인스타그램 톤 | 페이지 정보 밀도 낮음 | ✗ |
| 화이트 미니멀 | 깔끔, 모던 | 페르소나 시그니처 부족 | ✗ |

**채택**: 매거진 톤 + Hero만 다크. Hero→Body 전환을 시그니처로.

### 3.2 폰트 선택

| 옵션 | 장점 | 단점 | 채택 |
|---|---|---|---|
| Noto Serif KR (현재) | 한국어 serif | 큰 사이즈에서 무거움, 매거진 톤 부족 | ✗ (actor에서 제거) |
| **Cormorant Garamond + Pretendard** | VOGUE 디지털 커버 패턴, 한글·라틴 분리 최적 | 폰트 2종 추가 부담 | **✅** |
| Cormorant + Noto Sans KR | 안정적 | Pretendard 대비 매거진 톤 약함 | ✗ |
| 자가 호스팅 webfont 일체 | 빌드 자율성 | 폰트 라이선스·관리 부담 | (Pretendard만 필요 시) |

**채택**: Cormorant (라틴 헤드라인) + Pretendard (국문 본문/UI). `next/font/google`.

### 3.3 Hero 영상 처리

사용자 결정: **placeholder shell 우선, 실제 영상 추후**.

| 처리 | 장점 | 채택 |
|---|---|---|
| `<video>` 요소를 항상 마운트하되 `src`를 데이터로 분기 | URL 페이스트만으로 활성 | ✅ (REQ-ACT-O-001) |
| reel 도착 시 비로소 video 마운트 | 빈 video 요소 마운트 회피 | ✗ (markup 변경 필요) |
| GIF/Lottie 대체 | 가볍지만 monologue 표현 불가 | ✗ |

**채택**: `<video>` shell + `HERO.reelUrl` 분기 + 정적 portrait fallback + grain overlay + 미세 ken-burns.

### 3.4 Reel 섹션 패턴

| 옵션 | 장점 | 단점 | 채택 |
|---|---|---|---|
| **Netflix-style detail page (탭 + 좌 player + 우 list)** | 캐스팅 디렉터가 즉시 이해, episode 비교 쉬움 | 모바일 stack 처리 필요 | **✅** |
| YouTube 임베드 grid | 친숙, 빠른 구현 | iframe 의존, third-party 추적, 매거진 톤 깨짐 | ✗ |
| 단일 큰 영상 + 카테고리 칩 | 단순 | episode 11개 동시 표시 어려움 | ✗ |
| Hero에 영상 1개 + 본문에 grid | 영상 reuse | 본문 갤러리와 hero 영상 중복 | ✗ |

**채택**: Netflix detail page 패턴 + WAI-ARIA tabs.

### 3.5 Reel 카테고리 라벨 (전 vs 후)

| 이전 (사용자가 폐기) | 신규 (locked) |
|---|---|
| 코미디 / 감성 / 자기소개 / 출연 | Intro (자기소개) · Scene (독백) · Featured (합·다인) |

이유: 코미디/감성은 장르 카테고리이고, 자기소개/출연은 형식 카테고리. 혼합. 신규 라벨은 academy training 출력(intro 1, monologue 5, scene work 5)에 맞춰 형식 카테고리로 통일.

### 3.6 Character Card 패턴

| 옵션 | 장점 | 단점 | 채택 |
|---|---|---|---|
| **CSS 3D flip (front cover / back details)** | 한 카드에 인상 + 디테일, 인터랙티브 호기심 | 모바일 hover 미지원 → tap 필요, reduced-motion 분기 필요 | **✅** |
| 클릭 시 모달 확장 | 정보 더 많이 표시 | 매거진 호흡 깨짐, 모달 오버레이 무거움 | ✗ |
| hover 시 카드 위 정보 슬라이드 | 단순 | flip 대비 호기심 부족 | ✗ |
| 단순 카드 (앞면만) | 가장 단순 | character note·hashtag 표시 자리 부족 | ✗ |

**채택**: flip + hybrid 처리(still/poster/low-quality-still/placeholder 4종 cardKind).

### 3.7 클라이언트 JS 분리

| 컴포넌트 | Server/Client | 이유 |
|---|---|---|
| `Hero.tsx` | Server | SSR로 LCP 안정화 |
| `HeroReel.tsx` | Client | video element + reduced-motion/data-saver 분기 + ken-burns |
| `Profile.tsx` | Server | 정적 grid |
| `Reel.tsx` | Server | 데이터를 ReelPlayer로 전달 |
| `ReelPlayer.tsx` | Client | 탭 state + video src swap + 키보드 패턴 |
| `Roles.tsx` | Server | 정적 컨테이너 |
| `RoleTimeline.tsx` | Server | 기본 SSR. scroll-linked 애니메이션 도입 시에만 Client. |
| `CharacterCard.tsx` | Client | flip state + hover/tap 분기 + reduced-motion fallback |
| `Filmography.tsx` | Server | 정적 list |
| `Contact.tsx` | Server | 정적 link |

원칙: `/dev` SPEC와 동일하게 Server-first, Client는 인터랙션이 진짜 필요한 leaf로 한정. 번들·CLS 최소화.

---

## 4. 6섹션 상세 설계 (locked from D1)

### Section 0: HERO (carbon)

**목표**: 시네마틱 진입. 사용자 첫 0.5초.

**구성**:
- 100vh, `#0a0a0a` 배경
- `<video>` shell + `HERO.reelUrl` 분기(빈 값 → portrait poster + grain + 미세 ken-burns)
- 좌측 하단 카피: `서해우 / Seo Haeu — Actor since 2023` + 출연작 라인업 힌트 한 줄
- 우측 하단 scroll cue
- reduced-motion / data-saver 환경 분기

**기술**:
- `<video autoplay muted playsinline loop preload="none" poster>`
- `IntersectionObserver` 또는 즉시 play (가시 viewport 진입 후)
- ken-burns: CSS `transform: scale(1) → scale(1.03)` + `prefers-reduced-motion: reduce` 시 정지

### Section 1: PROFILE (off-white 진입)

**목표**: 큰 portrait + 큰 영문 H1 + profile 테이블.

**구성**:
- 12-col grid: 좌 5-6col portrait, 우 6-7col Cormorant H1
- `S E O   H A E U` (Cormorant uppercase, letter-spacing 0.3em+)
- 한국어 `서해우` 부제
- profile 테이블 (생년 / 신체 / 언어 / 특기 / 이메일)
- hero→profile dark→off-white 80px gradient bridge

### Section 2: REEL (Netflix detail page)

**목표**: 연기 능력 증명.

**구성**:
- 상단 카테고리 탭 3 (Intro/Scene/Featured)
- 좌 65% player + 우 35% episode list
- 모바일 player → list 세로 stack
- WAI-ARIA tabs 표준
- 빈 `videoUrl` → skeleton ("영상 준비 중" + grain)

### Section 3: ROLES (Timeline + Character Cards)

**목표**: 인물 단면. "이 배우의 해석 폭".

**구성**:
- 상단 horizontal timeline (6작품, 연도 descending)
- 하단 character card grid (5 real + 1 placeholder = 6)
- 카드 hybrid 처리: still / poster / low-quality-still / placeholder
- 3D flip front/back, reduced-motion 시 opacity fade

### Section 4: FILMOGRAPHY (매거진 인덱스)

**목표**: 작품 list를 매거진 인덱스 호흡으로.

**구성**:
- 카테고리(드라마/영화/뮤지컬) 그룹
- 매거진 타이포: 연도 | 작품명 | 플랫폼 chip | roleType | 캐릭터명
- hairline rule + 절제된 액센트

### Section 5: CONTACT (editorial 클로징)

**목표**: 캐스팅 inquiry CTA, 큰 editorial 톤.

**구성**:
- 중앙 정렬, `C A S T   I N Q U I R Y` Cormorant uppercase
- 부제 한 줄
- 이메일 / 인스타 두 줄
- emoji 제거 (typography만)

---

## 5. 위험 분석

| 위험 | 확률 | 영향 | 완화책 |
|---|---|---|---|
| off-white 위 #b8a98a contrast AA 미달 | 고 | 중 | hairline 액센트로만 사용, 본문은 ink. 구현 단계 측정. |
| 모바일 Safari `<video>` autoplay 차단 | 중 | 고 | muted + playsinline 필수, data-saver 환경 fallback |
| character card flip의 hydration mismatch | 중 | 중 | SSR 출발 상태 항상 front face, flip은 사용자 인터랙션 후 |
| Cormorant Garamond 큰 한글 깨짐 | 저 | 중 | 한글은 절대 Cormorant 매핑 금지, Pretendard만 |
| Lighthouse Performance 80 미달 (hero video) | 중 | 고 | preload=none, poster를 LCP element로, IO 진입 후 play |
| 자산 미입수 상태에서 페이지 빈 듯 | 중 | 중 | placeholder UI(skeleton + grain)를 elegant하게 |
| 키보드 only ReelPlayer 화살표 패턴 누락 | 중 | 고 | WAI-ARIA tabs 표준 구현 + E2E |
| 6개 작품 set 임의 변경 | 저 | 고 | `data.ts` `@MX:ANCHOR` + E2E assertion |
| 모바일에서 character card flip UX confusion | 중 | 중 | 첫 진입 hint 또는 작은 "Tap to flip" 라벨 |
| Reel `videoUrl` 빈 상태가 너무 많아 부정적 인상 | 중 | 고 | 첫 채워질 episode 1개 우선(intro) → 페이지 진입 첫 임팩트 보존 |

---

## 6. 참고 패턴 (Inspirations)

> *외부 URL을 새로 발명하지 않음 — 사용자가 이미 알고 있는 사이트 카테고리 reference만.*

- **VOGUE Korea 디지털 커버** — off-white 매거진 호흡, dark hero → light body 전환
- **Netflix 작품 detail page** — 탭 + 좌 player + 우 episode list 패턴
- **The New York Times "Snow Fall" / interactive editorial** — 큰 사진 + 큰 타이포 + 스크롤 호흡
- **GQ Korea / W Korea actor feature** — 큰 portrait + character note 형식
- **IMDb actor pages** — filmography 인덱스 + 캐스팅 컨벤션
- **Apple TV+ shows** — Hero 영상 + 본문 detail 전환

(실제 구현 시 직접 표절 없이 정신만 차용)

---

## 7. 의사결정 추적

| 결정 | 채택 | 근거 |
|---|---|---|
| 페이지 비주얼 톤 | Editorial Magazine (VOGUE Korea) + Hero만 carbon | 사용자 명시, 캐스팅 시장 표준 |
| 폰트 | Cormorant Garamond (라틴) + Pretendard (국문). Noto Serif KR 제거 | 매거진 톤 정렬 |
| 섹션 수 | 6 (Hero/Profile/Reel/Roles/Filmography/Contact) | 사용자 명시 (D1) |
| Hero | `<video>` shell + `HERO.reelUrl` 분기 + portrait fallback | 사용자 명시 (D6) |
| Reel 카테고리 | Intro / Scene / Featured (3 + 한국어 부제) | 사용자 명시 (D3), 이전 4종 라벨 폐기 |
| Reel UI | Netflix detail page (탭 + 좌 player + 우 list) | 사용자 명시 |
| 영상 호스팅 | 자체 호스팅 `<video>` 만 (YouTube/Vimeo iframe 금지) | 사용자 명시 (REQ-ACT-N-001), 톤·추적 회피 |
| Character cards | 5 real + 1 placeholder, 4종 cardKind, CSS 3D flip | 사용자 명시 (D4) |
| 작품 set | §6 D5 6작품, 기존 오류 항목 정정·제거 | 사용자 명시 (D5) |
| character note 카피 | SPEC 단계에서 schema만, 카피는 별도 인터뷰 round | 사용자 명시 |
| `data-accent="actor"` | 유지 | 페르소나 격리 |
| `/dev` cross-link | 금지 | 직업 완벽 분리 |
| 라우트 | `/actor` 동일 유지 | SEO / 외부 링크 유지 |
| 다국어 | 한국어 고정 (영문 라벨 카피 단위 예외) | 캐스팅 시장 언어 |
| Three.js / WebGL | 미사용 (`/dev` 시그니처와 분리) | 페르소나 차별화 |
| Client JS leaf | 4종 (HeroReel / ReelPlayer / CharacterCard / RoleTimeline 옵션) | 번들·CLS 최소화 |

---

## 8. 다음 단계

1. **spec.md** — 6섹션 EARS 요구사항 명세 (완료)
2. **plan.md** — 구현 단계, 컴포넌트 분리, 위험 완화 액션 (완료)
3. **acceptance.md** — Given/When/Then 시나리오, 성능·접근성 기준 (완료)
4. **tasks.md** — 작업 분해(skeleton, expert-frontend 세분화 대상) (완료)
5. **progress.md** — phase 진행 추적 (draft 초기화)
6. **spec-compact.md** — Run phase용 압축본 (완료)

이후 사용자 승인 → `/moai run SPEC-ACTOR-REDESIGN-001` 으로 구현 진입.
