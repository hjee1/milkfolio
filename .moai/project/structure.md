# Structure — milkfolio

Next.js 16 App Router 단일 프로젝트. 페르소나별 라우트 세그먼트 분리.

## 최상위 레이아웃

```
milkfolio/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃 (글로벌 폰트·메타)
│   ├── page.tsx            # 랜딩 (/) — 3-panel hover-expand
│   ├── page.module.css     # 랜딩 스타일
│   ├── globals.css         # 글로벌 CSS, Tailwind 토큰
│   ├── actor/              # /actor — 서해우 배우 프로필 (한국어, SPEC-ACTOR-REDESIGN-001 6섹션 Editorial Magazine)
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Server parent, 6 sections 조립
│   │   ├── page.module.css # off-white body + carbon hero + bridge + 12-col grid
│   │   ├── data.ts         # PROFILE / HERO / REEL / TIMELINE / CHARACTER_CARDS / FILMOGRAPHY / NAV_LINKS
│   │   └── _components/
│   │       ├── Hero.tsx                # Server, 좌측 카피 + scroll cue
│   │       ├── HeroReel.tsx            # Client, reelUrl 분기 + ken-burns + reduced-motion/data 분기
│   │       ├── Profile.tsx             # Server, 12-col magazine grid + Cormorant h2
│   │       ├── Reel.tsx                # Server, Netflix detail page header
│   │       ├── ReelPlayer.tsx          # Client, WAI-ARIA tabs + sessionStorage actor.reel.lastEpisode.*
│   │       ├── Roles.tsx               # Server, RoleTimeline + CharacterCard 3/2/1 col grid
│   │       ├── RoleTimeline.tsx        # Server, horizontal 6작품 magazine 인덱스
│   │       ├── CharacterCard.tsx       # Client, 4종 cardKind + 3D flip + chevron hint sessionStorage + CustomEvent
│   │       ├── Filmography.tsx         # Server, 매거진 인덱스 6작품
│   │       ├── Contact.tsx             # Server, C A S T I N Q U I R Y editorial
│   │       ├── *.module.css            # 컴포넌트별 스타일
│   │       └── shared/
│   │           ├── tokens.ts           # ACTOR_TOKENS (accentGold #7c6240 off-white / accentGoldOnDark #b8a98a carbon)
│   │           ├── usePrefersReducedMotion.ts
│   │           └── usePrefersReducedData.ts
│   ├── dev/                # /dev — Hyunwoo Jee AI Tech Engineer (영어)
│   │   ├── layout.tsx
│   │   ├── page.tsx        # ★ SPEC-DEV-REDESIGN-001 대상
│   │   └── page.module.css
│   ├── designer/           # /designer — 디자이너 (동생 예정)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── page.module.css
│   │   ├── projects.ts
│   │   ├── ProjectGallery.tsx
│   │   └── ProjectGallery.module.css
│   └── agent/              # /agent — 캐스팅 대시보드 (비밀번호 게이트)
│       ├── layout.tsx
│       ├── page.tsx
│       ├── page.module.css
│       ├── actions.ts      # Server Actions (게이트 검증 등)
│       └── AgentClient.tsx # Client Component (대시보드 인터랙션)
│
├── components/             # 공유 컴포넌트 (페르소나 간 공유 최소화)
│   ├── SiteNav.tsx         # 공통 네비 (페르소나별 옵트인)
│   ├── SiteNav.module.css
│   ├── SiteFooter.tsx
│   ├── SiteFooter.module.css
│   └── ui/                 # shadcn/ui 컴포넌트 (현재 비어있음)
│
├── lib/                    # 유틸·타입
│   ├── cn.ts               # clsx + tailwind-merge 헬퍼
│   ├── parse-data-html.ts  # /agent data.html 파서
│   └── types/
│       └── agent.ts        # 캐스팅 데이터 타입 정의
│
├── public/                 # 정적 자산
│   ├── actor/              # 배우 스틸·갤러리
│   ├── designer/           # 디자이너 placeholder
│   └── assets/             # 공통 자산
│
├── e2e/                    # Playwright E2E 테스트
│   ├── landing.spec.ts
│   ├── actor.spec.ts
│   ├── dev.spec.ts         # /dev 회귀 테스트 (SPEC-DEV-REDESIGN-001에서 확장)
│   ├── designer.spec.ts
│   └── agent.spec.ts
│
├── docs/                   # 사용자용 마크다운 문서
├── .moai/                  # MoAI 메타데이터
│   ├── config/             # MoAI 설정
│   ├── specs/              # SPEC 문서 (이 파일 포함)
│   ├── project/            # product/structure/tech 컨텍스트
│   ├── design/             # 디자인 브리프
│   ├── reports/            # plan-audit 등 리포트
│   └── learning/           # 학습된 패턴
├── .claude/                # Claude Code 설정 (agents, rules, skills)
├── CLAUDE.md               # 프로젝트 컨텍스트 (Claude 자동 로드)
└── PROJECT_LOG.md          # 변경 이력 로그
```

## 페르소나별 레이아웃 분리 원칙

- **글로벌 자산 최소화**: `app/globals.css`는 공통 CSS reset과 폰트 변수만. 페르소나별 토큰은 각 `page.module.css`에 격리.
- **레이아웃 분리**: `app/{persona}/layout.tsx`에서 페르소나별 메타·폰트·테마를 차등 적용.
- **컴포넌트 공유 최소화**: `SiteNav`/`SiteFooter`는 옵션이며, /dev처럼 커스텀 nav가 필요한 경우 인라인 사용 허용.

## /dev 라우트 현재 상태 (SPEC-DEV-REDESIGN-001 변경 전)

| 파일 | LOC | 역할 |
|---|---|---|
| `app/dev/layout.tsx` | ~30 | 영어 메타, dev 테마 |
| `app/dev/page.tsx` | 350 | Pure Server Component, 5섹션 (Hero/About/Stack/Experience/Contact) |
| `app/dev/page.module.css` | ~12K | cyan #38d9ff 액센트, glassmorphism 스타일 |

특징:
- 클라이언트 JS 0
- 정적 콘텐츠, 인터랙션 없음
- 데이터 엔지니어 정체성 기준 (재설계에서 AI Technical Engineer로 전환)

## /dev 라우트 재설계 후 (SPEC-DEV-REDESIGN-001)

| 파일 | 변경 |
|---|---|
| `app/dev/page.tsx` | Server Component 유지하되 Client Component 자식 다수 도입 |
| `app/dev/page.module.css` | 액센트 컬러 시스템 재정의 (cyan 유지하되 추가 톤) |
| `app/dev/_components/Hero.tsx` | (신규) Cinematic WebGL hero (Three.js/R3F) |
| `app/dev/_components/Manifesto.tsx` | (신규) AI Tech Engineer 선언 |
| `app/dev/_components/Lab.tsx` | (신규) 인터랙티브 추상 데모 |
| `app/dev/_components/Stack.tsx` | (신규) AI 기술 스택 시각화 |
| `app/dev/_components/Craft.tsx` | (신규) 메타 텔레메트리 |
| `app/dev/_components/Contact.tsx` | (신규) 클로징 |
| `app/dev/_components/*.module.css` | 컴포넌트별 스타일 모듈 |

## 명명 규칙

- 파일: kebab-case 또는 PascalCase (컴포넌트)
- CSS Modules: `Component.module.css`
- 비공개 컴포넌트(라우트 전용): `_components/` 접두사 (Next.js 라우트 제외 규칙 활용)
- 타입: `lib/types/{domain}.ts`
- 서버 액션: 라우트 디렉터리의 `actions.ts`

## 빌드·배포 구조

- **로컬 개발**: `pnpm dev` (Turbopack)
- **빌드**: `pnpm build` → `.next/`
- **배포**: Vercel (main 브랜치 자동 배포)
- **도메인**: milkfolio.space (Namecheap → Vercel)
- **이전 호스팅**: GitHub Pages on `hjee1/milkfolio` (deprecated, see SPEC-MIGRATE-NEXT-001 Phase 7)
