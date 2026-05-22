// /actor 데이터 모듈 (Phase 2 재구조화).
//
// 이 모듈은 캐스팅 디렉터가 30초 안에 "회의를 잡고 싶다"를 결정할 수 있도록
// 페이지에 노출되는 모든 콘텐츠의 단일 진실 공급원(single source of truth)이다.
//
// 스키마는 SPEC-ACTOR-REDESIGN-001 §5에 정의되어 있다:
//   PROFILE / HERO / REEL / TIMELINE / CHARACTER_CARDS / FILMOGRAPHY / NAV_LINKS
//
// 페르소나 분리 (REQ-ACT-N-004): 이 모듈의 어떤 텍스트 필드에도 IIT /
// Illinois Institute of Technology / Computer Science / Hanwha / 한화시스템 /
// AI Technical Engineer / AI Engineer / Data Engineer / Hyunwoo Jee / 지현우 /
// Terry / developer / engineer / 엔지니어 가 등장해서는 안 된다.
// 'Seo Haeu' / '서해우'는 허용. 이메일 'terryjhw@gmail.com'은 캐스팅 contact로
// 허용되지만 'Terry'는 word boundary로 본문에 별도 노출되지 않도록 한다.

export type ProfileInfoRow = {
  label: string;
  value: string;
  href?: string;
};

export type ReelCategoryId = "intro" | "scene" | "featured";

export type ReelEpisode = {
  id: string;
  title: string;
  videoUrl?: string; // 빈 값/undefined → skeleton (REQ-ACT-O-002)
  durationSec?: number;
  thumb?: string;
};

export type ReelCategory = {
  id: ReelCategoryId;
  labelEn: string;
  labelKo: string;
  episodes: ReelEpisode[];
};

export type RoleType =
  | "Netflix · 단역"
  | "단편 · 주연"
  | "뮤지컬 · 주연"
  | string;

export type TimelineEntry = {
  year: number;
  workTitle: string;
  platform?: string;
  roleType: RoleType;
  roleName: string;
  hasCharacterCard: boolean;
};

export type CardKind = "still" | "poster" | "low-quality-still" | "placeholder";

export type CharacterCard = {
  id: string;
  characterName: string;
  workTitle: string;
  workPlatform?: string;
  year: number;
  roleType: RoleType;
  coverImage: string | null; // null → typographic front placeholder (REQ-ACT-O-003)
  stills: string[];
  note: string; // Phase 6 인터뷰까지 빈 문자열
  hashtags: string[]; // Phase 6 인터뷰까지 빈 배열
  cardKind: CardKind;
};

export type FilmographyEntry = {
  year: number;
  title: string;
  platform?: string;
  roleType: RoleType;
  roleName: string;
};

export type FilmographyBlock = {
  category: "드라마" | "영화" | "뮤지컬";
  items: FilmographyEntry[];
};

export type NavLink = {
  href: string;
  label: string;
};

// ─── PROFILE ───────────────────────────────────────────────────────
// Profile 섹션이 렌더하는 매거진 데이터.
//
// 학력(IIT / Computer Science)은 REQ-ACT-N-004 prohibited substring 목록에
// 직접 등장하므로 info 행에 절대 추가하지 않는다. 본업(한화시스템 / Data
// Engineer / AI Engineer)도 동일.
export const PROFILE = {
  name: "서해우",
  nameEn: "Seo Haeu",
  role: "Actor",
  since: 2023,
  hero: "/actor/assets/hero.jpg",
  portrait: "/actor/assets/profile.jpg",
  info: [
    { label: "이름", value: "서해우 (Seo Haeu)" },
    { label: "생년월일", value: "1994.04.18" },
    { label: "신체", value: "180cm · 60kg" },
    {
      label: "언어",
      value:
        "한국어 · 영어 (Native) · 중국어 (원어민수준) · 일본어 (비즈니스)",
    },
    { label: "특기", value: "승마 (2년) · 배구 (1년)" },
    {
      label: "이메일",
      value: "terryjhw@gmail.com",
      href: "mailto:terryjhw@gmail.com",
    },
  ] satisfies ProfileInfoRow[],
} as const;

// ─── HERO ──────────────────────────────────────────────────────────
// /actor Hero 영상/포스터 contract (Phase 1).
// reelUrl이 비어 있으면 HeroReel은 정적 portrait + grain + ken-burns로 출발하고,
// 사용자가 academy 모놀로그 클립 편집 후 URL만 페이스트하면 markup 변경 없이
// <video>가 활성된다 (REQ-ACT-O-001). lineupHint는 Hero 좌측 하단 카피
// 마지막 줄에 표시된다 (REQ-ACT-E-001).
//
// @MX:NOTE: [AUTO] HERO contract — reelUrl 페이스트 한 줄로 video 활성.
//           Phase 2+에서 PROFILE/REEL/TIMELINE/CHARACTER_CARDS 등 전면
//           재구조화가 들어와도 이 HERO 객체의 스키마는 변경되지 않는다.
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-O-001, REQ-ACT-E-001, REQ-ACT-E-006
export const HERO = {
  reelUrl: "", // 빈 값 → HeroReel은 poster 단독 표시
  posterImage: "/actor/assets/hero.jpg",
  lineupHint: "Netflix · 당신이 죽였다 외",
} as const;

// ─── REEL ──────────────────────────────────────────────────────────
// Phase 3에서 ReelPlayer가 소비하는 카테고리 카탈로그.
// Intro 1개 + Scene 5개 + Featured 5개 = 11개의 episode slot이 예약된다.
// videoUrl이 빈 문자열인 episode는 REQ-ACT-O-002에 따라 "영상 준비 중"
// skeleton으로 표시된다.
//
// @MX:NOTE: [AUTO] Episode 카탈로그 스키마. videoUrl="" → REQ-ACT-O-002
//           skeleton 발화. 사용자가 academy 클립을 편집 후 url 한 줄만
//           페이스트하면 markup 변경 없이 player가 활성된다.
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-E-002, REQ-ACT-E-003, REQ-ACT-O-002
export const REEL: ReelCategory[] = [
  {
    id: "intro",
    labelEn: "Intro",
    labelKo: "자기소개",
    episodes: [
      { id: "intro-1", title: "자기소개 영상", videoUrl: "" },
    ],
  },
  {
    id: "scene",
    labelEn: "Scene",
    labelKo: "독백",
    episodes: [
      { id: "scene-1", title: "독백 #1", videoUrl: "" },
      { id: "scene-2", title: "독백 #2", videoUrl: "" },
      { id: "scene-3", title: "독백 #3", videoUrl: "" },
      { id: "scene-4", title: "독백 #4", videoUrl: "" },
      { id: "scene-5", title: "독백 #5", videoUrl: "" },
    ],
  },
  {
    id: "featured",
    labelEn: "Featured",
    labelKo: "합 · 다인 연기",
    episodes: [
      { id: "featured-1", title: "합 · 다인 연기 #1", videoUrl: "" },
      { id: "featured-2", title: "합 · 다인 연기 #2", videoUrl: "" },
      { id: "featured-3", title: "합 · 다인 연기 #3", videoUrl: "" },
      { id: "featured-4", title: "합 · 다인 연기 #4", videoUrl: "" },
      { id: "featured-5", title: "합 · 다인 연기 #5", videoUrl: "" },
    ],
  },
];

// ─── TIMELINE ──────────────────────────────────────────────────────
// Phase 4 Roles 섹션의 horizontal timeline 데이터.
// 연도 descending. 6개 작품 (REQ-ACT-U-006).
export const TIMELINE: TimelineEntry[] = [
  {
    year: 2026,
    workTitle: "너만 있으면",
    roleType: "단편 · 주연",
    roleName: "준혁",
    hasCharacterCard: true,
  },
  {
    year: 2025,
    workTitle: "당신이 죽였다",
    platform: "Netflix",
    roleType: "Netflix · 단역",
    roleName: "점원",
    hasCharacterCard: true,
  },
  {
    year: 2025,
    workTitle: "그래도 사랑이었다",
    roleType: "단편 · 주연",
    roleName: "국현",
    hasCharacterCard: true,
  },
  {
    year: 2024,
    workTitle: "요즘것들",
    roleType: "뮤지컬 · 주연",
    roleName: "민혁",
    hasCharacterCard: true,
  },
  {
    year: 2023,
    workTitle: "어느날 엄마가 봉투를 썼다",
    roleType: "단편 · 주연",
    roleName: "대현",
    hasCharacterCard: true,
  },
  {
    year: 2023,
    workTitle: "눈",
    roleType: "단편 · 주연",
    roleName: "집주인",
    hasCharacterCard: true,
  },
];

// ─── CHARACTER_CARDS ───────────────────────────────────────────────
// Phase 4 Roles 섹션의 6장 character card.
// 5 real(stills/poster/low-quality-still) + 1 placeholder = 6.
// 순서: TIMELINE과 동일하게 연도 descending.
//
// note, hashtags는 SPEC 단계에서 빈 문자열·빈 배열로 출발한다 (Phase 6
// 인터뷰 round에서 채워진다, SPEC §2 out-of-scope).
// coverImage === null인 카드는 REQ-ACT-O-003에 따라 typographic front
// placeholder로 렌더된다.
//
// @MX:ANCHOR: [AUTO] §6 D5 합의된 6작품 set의 인물 단면. fan_in은
//             Phase 4 Roles 섹션 (RoleTimeline + CharacterCard grid +
//             Roles 컨테이너)에서 발생한다. E2E H1/H2 회귀가 이 배열의
//             정확성을 검증한다.
// @MX:REASON: 카드 set이 임의로 추가/삭제되면 SPEC §6 D5(REQ-ACT-U-006,
//             REQ-ACT-N-005) 위반이 발생하고, 캐스팅 디렉터가 보는 작품
//             스코프가 망가진다. 캐릭터명(점원/대현/집주인/국현/민혁/준혁)
//             과 cardKind도 임의 변경 금지.
// @MX:NOTE: [AUTO] note는 ""로, hashtags는 []로 출발한다. Phase 6 인터뷰
//           round에서 사용자 입력으로 채워진다.
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-006, REQ-ACT-N-005,
//           REQ-ACT-E-004, REQ-ACT-E-005, REQ-ACT-O-003
export const CHARACTER_CARDS: CharacterCard[] = [
  {
    id: "junhyeok-2026",
    characterName: "준혁",
    workTitle: "너만 있으면",
    year: 2026,
    roleType: "단편 · 주연",
    coverImage: null,
    stills: [],
    // Phase 6 interview round 5 (2026-05-22, 본인 직접 작성)
    note: "썸을 야무지게 말아먹고 키친 야무지게 뜯는 압도적 존재감. 땡길걸...",
    hashtags: ["#단편", "#주연", "#2026"],
    cardKind: "placeholder",
  },
  {
    id: "jeomwon-2025",
    characterName: "점원",
    workTitle: "당신이 죽였다",
    workPlatform: "Netflix",
    year: 2025,
    roleType: "Netflix · 단역",
    coverImage: "/actor/assets/still_netflix_1.jpg",
    stills: [
      "/actor/assets/still_netflix_1.jpg",
      "/actor/assets/still_netflix_2.jpg",
    ],
    // Phase 6 interview round 1 (2026-05-22, 본인 직접 작성)
    note: "몇 컷이 들어가는 단역이지만 손님을 응대하는 점원을 평범하게 정확히 연기하며 주연들의 연기에 방해가 되지 않게 노력했습니다.",
    hashtags: ["#Netflix", "#2025", "#생활감", "#깔끔함", "#점원"],
    cardKind: "still",
  },
  {
    id: "gukhyeon-2025",
    characterName: "국현",
    workTitle: "그래도 사랑이었다",
    year: 2025,
    roleType: "단편 · 주연",
    coverImage: null,
    stills: [],
    note: "",
    hashtags: [],
    cardKind: "low-quality-still",
  },
  {
    id: "minhyeok-2024",
    characterName: "민혁",
    workTitle: "요즘것들",
    year: 2024,
    roleType: "뮤지컬 · 주연",
    coverImage: null,
    stills: [],
    // Phase 6 interview round 4 (2026-05-22, 본인 직접 작성)
    note: "민혁의 반전을 숨기며 대사와 넘버들로 자신의 마음을 차근차근 들어내는 캐릭터를 연기했습니다.",
    hashtags: ["#2024", "#요즘것들", "#대학로", "#종합예술", "#반전"],
    cardKind: "poster",
  },
  {
    id: "daehyeon-2023",
    characterName: "대현",
    workTitle: "어느날 엄마가 봉투를 썼다",
    year: 2023,
    roleType: "단편 · 주연",
    coverImage: "/actor/assets/still_bongtu_1.jpg",
    stills: [
      "/actor/assets/still_bongtu_1.jpg",
      "/actor/assets/still_bongtu_2.jpg",
      "/actor/assets/still_bongtu_3.jpg",
    ],
    // Phase 6 interview round 2 (2026-05-22, 본인 직접 작성)
    note: "어머니와의 갈등을 봉투로 표현한 작품. 단편이지만 주연으로서 갈등의 감정선을 갈등과 이해를 통해 나만의 방식으로 표현했습니다.",
    hashtags: ["#단편", "#주연", "#가족", "#봉투", "#어머니와아들"],
    cardKind: "still",
  },
  {
    id: "jipjuin-2023",
    characterName: "집주인",
    workTitle: "눈",
    year: 2023,
    roleType: "단편 · 주연",
    coverImage: "/actor/assets/still_nun_1.jpg",
    stills: [
      "/actor/assets/still_nun_1.jpg",
      "/actor/assets/still_nun_2.jpg",
    ],
    // Phase 6 interview round 3 (2026-05-22, 본인 직접 작성)
    note: "집주인이 여주인공을 감시하는 범죄스릴러. 집, 집주인, 입주자, 이 세가지의 요소로 진행되는 스토리.",
    hashtags: ["#단편", "#주연", "#범죄스릴러", "#변태"],
    cardKind: "still",
  },
];

// ─── FILMOGRAPHY ───────────────────────────────────────────────────
// Phase 2 Filmography 섹션의 매거진 인덱스 데이터.
// 카테고리별 그룹화 (드라마 / 영화 / 뮤지컬), 작품 총합 6개 (REQ-ACT-U-006).
//
// @MX:ANCHOR: [AUTO] §6 D5 합의된 6작품 set. Filmography 섹션이 단독으로
//             import하지만 Roles 섹션의 RoleTimeline + CHARACTER_CARDS와
//             함께 같은 6작품 set을 시각화하므로 데이터 일관성이 페이지
//             전체 신뢰도와 직결된다.
// @MX:REASON: 작품 set이 임의로 추가/삭제되면 REQ-ACT-U-006, REQ-ACT-N-005
//             위반이 발생하며 E2E H1/H2가 빨갛게 돌아간다. 캐릭터명·연도·
//             roleType이 정정 후 표기에서 벗어나면 캐스팅 디렉터에게
//             부정확한 정보가 노출된다.
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-006, REQ-ACT-N-005
export const FILMOGRAPHY: FilmographyBlock[] = [
  {
    category: "드라마",
    items: [
      {
        year: 2025,
        title: "당신이 죽였다",
        platform: "Netflix",
        roleType: "Netflix · 단역",
        roleName: "점원",
      },
    ],
  },
  {
    category: "영화",
    items: [
      {
        year: 2026,
        title: "너만 있으면",
        roleType: "단편 · 주연",
        roleName: "준혁",
      },
      {
        year: 2025,
        title: "그래도 사랑이었다",
        roleType: "단편 · 주연",
        roleName: "국현",
      },
      {
        year: 2023,
        title: "어느날 엄마가 봉투를 썼다",
        roleType: "단편 · 주연",
        roleName: "대현",
      },
      {
        year: 2023,
        title: "눈",
        roleType: "단편 · 주연",
        roleName: "집주인",
      },
    ],
  },
  {
    category: "뮤지컬",
    items: [
      {
        year: 2024,
        title: "요즘것들",
        roleType: "뮤지컬 · 주연",
        roleName: "민혁",
      },
    ],
  },
];

// ─── NAV_LINKS ─────────────────────────────────────────────────────
// SiteNav가 사용하는 6개 섹션 anchor 링크.
// Phase 2 시점에는 Reel / Roles 섹션이 아직 없으므로 anchor가 페이지에 없을
// 수 있지만 nav 자체에는 미리 등록한다 (Phase 3/4 도착 시 그대로 작동).
export const NAV_LINKS: NavLink[] = [
  { href: "#profile", label: "프로필" },
  { href: "#reel", label: "Reel" },
  { href: "#roles", label: "Roles" },
  { href: "#filmography", label: "필모그래피" },
  { href: "#contact", label: "연락처" },
];
