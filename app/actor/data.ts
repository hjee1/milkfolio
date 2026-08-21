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
// 'Seo Haeu' / '서해우'는 허용. 캐스팅 contact 이메일은 'seohaeu.actor@gmail.com'
// 으로 통일되어 페르소나 누출 위험이 0이다 (이전 terryjhw@... 매핑은 2026-05-26
// 제거됨).

export type ProfileInfoRow = {
  label: string;
  value: string;
  href?: string;
};

export type ReelCategoryId = "intro" | "scene" | "featured";

export type ReelEpisode = {
  id: string;
  title: string;
  /**
   * 자체호스팅 MP4 경로 또는 YouTube watch/embed/shortlink URL.
   * 빈 값/undefined → skeleton (REQ-ACT-O-002).
   * ReelPlayer가 youtu.be / youtube.com 도메인 감지 → iframe embed로 분기,
   * 그 외에는 `<video>` 자체호스팅으로 분기한다.
   */
  videoUrl?: string;
  durationSec?: number;
  thumb?: string;
};

export type ReelCategory = {
  id: ReelCategoryId;
  labelEn: string;
  labelKo: string;
  episodes: ReelEpisode[];
};

/**
 * REEL 섹션 하단 "더보기" 링크 — 본인 YouTube 플레이리스트.
 * 본 카탈로그에 묶인 3개 영상 외 다른 클립도 보고 싶은 캐스팅 디렉터를
 * 위해 외부 자원으로 안내한다 (target=_blank, noopener).
 */
export const REEL_MORE_PLAYLIST_URL =
  "https://www.youtube.com/playlist?list=PLI7Lwvfm7KZ8ZQmWbkrHSBT0WC1FTyJi9";

export type RoleType =
  | "Netflix · 단역"
  | "단편 · 주연"
  | "뮤지컬 · 주연"
  | "광고 · 주연"
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
  category: "드라마" | "영화" | "뮤지컬" | "광고";
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
      value: "seohaeu.actor@gmail.com",
      href: "mailto:seohaeu.actor@gmail.com",
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
  // 자체호스팅 720p h264 (4:35, ~22MB, no audio, faststart).
  // 원본 2560x1440 16Mbps → 1280x720 657kbps crf 23으로 압축.
  // HeroReel이 markup 변경 0으로 muted/loop/autoplay 활성됨 (REQ-ACT-O-001).
  reelUrl: "/actor/assets/hero-reel.mp4",
  posterImage: "/actor/assets/hero.jpg",
  lineupHint: "Netflix · 당신이 죽였다 외",
} as const;

// ─── REEL ──────────────────────────────────────────────────────────
// ReelPlayer가 소비하는 카테고리 카탈로그.
// Intro / Scene(연기영상) / Featured(출연영상) 3개 카테고리, 각 1개의 대표
// YouTube 영상으로 구성된다. 사용자가 카탈로그를 더 보고 싶으면 ReelPlayer
// 하단의 "더보기" 링크로 본인 YouTube 플레이리스트로 이동한다 (REEL_MORE_PLAYLIST_URL).
//
// 한국어 라벨 변경 (2026-05-26):
//   - Scene: "독백" → "연기영상"
//   - Featured: "합 · 다인 연기" → "출연영상"
//
// @MX:NOTE: [AUTO] YouTube URL은 ReelPlayer가 watch?v= / youtu.be / embed
//           모두 감지하여 iframe으로 분기. MP4면 자체호스팅 video 태그.
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-E-002, REQ-ACT-E-003, REQ-ACT-O-002
export const REEL: ReelCategory[] = [
  {
    id: "intro",
    labelEn: "Intro",
    labelKo: "자기소개",
    episodes: [
      {
        id: "intro-1",
        title: "자기소개 영상",
        videoUrl: "https://youtu.be/cnp6pjo-pfc",
      },
    ],
  },
  {
    id: "scene",
    labelEn: "Scene",
    labelKo: "연기영상",
    episodes: [
      {
        id: "scene-1",
        title: "연기영상 편집본",
        videoUrl: "https://youtu.be/THXm7fhqhz8",
      },
    ],
  },
  {
    id: "featured",
    labelEn: "Featured",
    labelKo: "출연영상",
    episodes: [
      {
        id: "featured-1",
        title: "출연영상 편집본",
        videoUrl: "https://youtu.be/tEgyueYan1I",
      },
    ],
  },
];

// ─── PHOTO_CONCEPTS ────────────────────────────────────────────────
// Profile 직후 섹션. 역할별 톤(직장인 / 다정한)을 카드 2장으로 보여준다.
// 단일 이미지 컨셉은 정적 표시, 다중 이미지 컨셉은 ConceptCarousel(Client)
// 에서 화살표 + dot + auto-rotate 처리. 이미지 경로는 public/actor/assets/
// concept/ 아래에 통일.
//
// 향후 직장인 컨셉 사진이 추가되면 images 배열만 늘리면 자동으로 carousel
// 로 승격된다 (단일 이미지 분기는 ConceptCarousel 내부에서 length===1로
// 판단).

export type PhotoConcept = {
  id: string;
  labelKo: string;
  labelEn: string;
  /** public/ 기준 절대 경로 배열. 1장 이상 보장. */
  images: string[];
  /** alt 텍스트 base — 캐러셀이 인덱스를 붙여서 사용. */
  altBase: string;
};

export const PHOTO_CONCEPTS: PhotoConcept[] = [
  {
    id: "office",
    labelKo: "직장인 컨셉",
    labelEn: "Office",
    images: [
      "/actor/assets/concept/office_1.jpeg",
      "/actor/assets/concept/office_2.jpeg",
      "/actor/assets/concept/office_3.jpeg",
    ],
    altBase: "서해우 직장인 컨셉",
  },
  {
    id: "warm",
    labelKo: "다정한 컨셉",
    labelEn: "Warm",
    images: [
      "/actor/assets/concept/warm_1.jpeg",
      "/actor/assets/concept/warm_2.jpeg",
      "/actor/assets/concept/warm_3.jpeg",
      "/actor/assets/concept/warm_4.jpeg",
      "/actor/assets/concept/warm_5.jpeg",
    ],
    altBase: "서해우 다정한 컨셉",
  },
];

// ─── TIMELINE ──────────────────────────────────────────────────────
// Phase 4 Roles 섹션의 horizontal timeline 데이터.
// 연도 descending. 6개 작품 (REQ-ACT-U-006).
export const TIMELINE: TimelineEntry[] = [
  {
    year: 2026,
    workTitle: "너만 있으면",
    roleType: "광고 · 주연",
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
// Phase 4 Roles 섹션의 character card 세트.
// 4 real(stills/poster) + 1 placeholder = 5.
// 순서: TIMELINE과 동일하게 연도 descending.
//
// Phase 6 amendment (2026-05-22): gukhyeon-2025 (국현 / 그래도 사랑이었다)
// 카드는 본인 결정으로 제거됨. 단 TIMELINE과 FILMOGRAPHY의 '그래도 사랑이었다'
// 작품 자체는 유지 (REQ-ACT-U-006 6작품 lock 준수). 결과적으로 작품 6편 ↔
// character card 5장 비대칭이 의도적으로 수용된다 (Roles의 RoleTimeline은
// 6작품 모두 표시, CharacterCard grid는 5장만 표시).
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
    roleType: "광고 · 주연",
    coverImage: "/actor/assets/still_neoman_1.jpg",
    stills: [
      "/actor/assets/still_neoman_1.jpg",
      "/actor/assets/still_neoman_2.jpg",
      "/actor/assets/still_neoman_3.jpg",
    ],
    // Phase 6 interview round 5 (2026-05-22 작성, 2026-05-26 본인 수정).
    note: "실패한 썸을 뒤로하고 배달음식으로 마음을 달래는 인간남자. 땡길걸...",
    hashtags: ["#광고", "#주연", "#2026"],
    cardKind: "still",
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
    id: "minhyeok-2024",
    characterName: "민혁",
    workTitle: "요즘것들",
    year: 2024,
    roleType: "뮤지컬 · 주연",
    coverImage: "/actor/assets/still_yojeum_1.jpg",
    stills: ["/actor/assets/still_yojeum_1.jpg"],
    // Phase 6 interview round 4 (2026-05-22, 본인 직접 작성)
    note: "민혁의 반전을 숨기며 대사와 넘버들로 자신의 마음을 차근차근 들어내는 캐릭터를 연기했습니다.",
    hashtags: ["#2024", "#요즘것들", "#대학로", "#종합예술", "#반전"],
    cardKind: "still",
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
  {
    category: "광고",
    items: [
      {
        year: 2026,
        title: "너만 있으면",
        roleType: "광고 · 주연",
        roleName: "준혁",
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
  { href: "#concepts", label: "컨셉" },
  { href: "#reel", label: "Reel" },
  { href: "#roles", label: "Roles" },
  { href: "#filmography", label: "필모그래피" },
  { href: "#contact", label: "연락처" },
];
