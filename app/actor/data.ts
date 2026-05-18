// Content of the actor page, separated from markup so it's easy to update
// without touching the JSX. Eventually this could move to a markdown / CMS
// layer, but keeping it as a typed TS module for Phase 2 keeps the build
// dead simple and type-checks every field.

export type FilmographyItem = {
  year: string;
  title: string;
  role: string;
  platform?: string;       // Netflix, etc — rendered as red badge
  type?: string;           // 단역·대역·주연 — rendered as accent border tag
  typeTag?: string;        // 단편, 웹드라마 — rendered as gray tag
};

export type FilmographyBlock = {
  category: string;        // 드라마, 영화, 뮤지컬
  items: FilmographyItem[];
};

export type GalleryItem = {
  src: string;             // path under /public
  alt: string;
  caption?: string;
  size?: "main" | "wide";  // grid placement modifier
};

export const PROFILE = {
  name: "서해우",
  nameEn: "Seo Haeu",
  role: "Actor",
  hero: "/actor/assets/hero.jpg",
  about: "/actor/assets/profile.jpg",
  info: [
    { label: "이름", value: "서해우 (Seo Haeu)" },
    { label: "생년월일", value: "1994.04.18" },
    { label: "신체", value: "180cm · 60kg" },
    {
      label: "언어",
      value: "한국어 · 영어 (Native) · 중국어 (원어민수준) · 일본어 (비즈니스)",
    },
    {
      label: "학력",
      value: "Illinois Institute of Technology\nB.S. Computer Science",
    },
    { label: "특기", value: "승마 (2년) · 배구 (1년)" },
    {
      label: "이메일",
      value: "terryjhw@gmail.com",
      href: "mailto:terryjhw@gmail.com",
    },
  ],
};

export const FILMOGRAPHY: FilmographyBlock[] = [
  {
    category: "드라마",
    items: [
      {
        year: "2025",
        title: "당신이 죽였다",
        platform: "Netflix",
        role: "매장직원 역",
        type: "단역 · 대역",
      },
    ],
  },
  {
    category: "영화",
    items: [
      { year: "2025", title: "눈", typeTag: "단편", role: "주연" },
      {
        year: "2023",
        title: "어느날 엄마가 봉투를 썼다",
        typeTag: "웹드라마",
        role: "단역 · 대역 · 주연",
      },
      { year: "2023", title: "삶", typeTag: "단편", role: "주연" },
    ],
  },
  {
    category: "뮤지컬",
    items: [
      { year: "2025", title: "오르골", role: "단역 · 주연" },
      { year: "2024", title: "오르골들", role: "단역 · 주연" },
    ],
  },
];

export const GALLERY: GalleryItem[] = [
  { src: "/actor/assets/still_acting_1.jpg", alt: "서해우 연기", size: "main" },
  { src: "/actor/assets/still_acting_2.jpg", alt: "서해우 연기" },
  { src: "/actor/assets/still_bongtu_2.jpg", alt: "어느날 엄마가 봉투를 썼다" },
  {
    src: "/actor/assets/still_netflix_1.jpg",
    alt: "Netflix 당신이 죽였다",
    caption: "Netflix · 당신이 죽였다 (2025)",
    size: "wide",
  },
  {
    src: "/actor/assets/still_netflix_2.jpg",
    alt: "Netflix 당신이 죽였다",
    caption: "Netflix · 당신이 죽였다 (2025)",
    size: "wide",
  },
  {
    src: "/actor/assets/still_nun_1.jpg",
    alt: "단편영화 눈",
    caption: "단편영화 · 눈 (2025)",
  },
  {
    src: "/actor/assets/still_nun_2.jpg",
    alt: "단편영화 눈",
    caption: "단편영화 · 눈 (2025)",
  },
  {
    src: "/actor/assets/still_bongtu_1.jpg",
    alt: "어느날 엄마가 봉투를 썼다",
    caption: "어느날 엄마가 봉투를 썼다 (2023)",
    size: "wide",
  },
  {
    src: "/actor/assets/still_bongtu_3.jpg",
    alt: "어느날 엄마가 봉투를 썼다",
    caption: "어느날 엄마가 봉투를 썼다 (2023)",
  },
];

export const NAV_LINKS = [
  { href: "#about", label: "프로필" },
  { href: "#filmography", label: "필모그래피" },
  { href: "#gallery", label: "갤러리" },
  { href: "#contact", label: "연락처" },
];
