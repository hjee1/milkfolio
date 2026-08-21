import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "./_components/Hero";
import { Profile } from "./_components/Profile";
import { PhotoConcepts } from "./_components/PhotoConcepts";
import { Reel } from "./_components/Reel";
import { Roles } from "./_components/Roles";
import { Filmography } from "./_components/Filmography";
import { Contact } from "./_components/Contact";
import { PROFILE, NAV_LINKS } from "./data";
import styles from "./page.module.css";

// /actor 페이지 (Phase 5 + 2026-05-26 PhotoConcepts 인서트).
// Server Component parent. 7섹션 구조:
//   ✓ Hero (Phase 1)
//   ✓ bridge (Phase 1)
//   ✓ Profile (Phase 2)
//   ✓ PhotoConcepts (2026-05-26)  ← Profile 직후 인서트
//   ✓ Reel (Phase 3)
//   ✓ Roles (Phase 4)
//   ✓ Filmography (Phase 2)
//   ✓ Contact (Phase 5)
//
// REQ-ACT-N-004 페르소나 분리: 본문(이 페이지에서 렌더되는 모든 텍스트)에
// developer / engineer / IIT / Hanwha / Hyunwoo Jee / 지현우 / Terry (word
// boundary) 등 prohibited substring이 0건이어야 한다. PROFILE.info에서
// 학력·본업이 제거되었고 Profile/Reel/Roles/Filmography/Contact 컴포넌트는
// 데이터 또는 정적 카피 그대로 렌더한다 — data.ts와 Contact의 정적 카피가
// 본 페이지의 페르소나 분리 single source of truth이다.
//
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001 Phase 0+1+2+3+4+5
// JSON-LD Person — 캐스팅 검색 노출용 구조화 데이터. 페르소나 분리
// (REQ-ACT-N-004) 준수: 배우 정체성 필드만 포함한다.
const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "서해우",
  alternateName: "Seo Haeu",
  jobTitle: "Actor",
  url: "https://milkfolio.space/actor",
  image: "https://milkfolio.space/actor/assets/hero.jpg",
  sameAs: [
    "https://www.instagram.com/oceanmeetrain",
    "https://www.youtube.com/playlist?list=PLI7Lwvfm7KZ8ZQmWbkrHSBT0WC1FTyJi9",
  ],
};

export default function ActorPage() {
  return (
    <div className={styles.body} data-actor-body>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
      />
      <SiteNav brand={PROFILE.name} links={NAV_LINKS} />

      <main>
        {/* HERO ─────────────────────────────────────── */}
        <Hero />

        {/* Hero → body bridge — REQ-ACT-U-009 LOCKED 60~100px gradient */}
        <div className={styles.heroBridge} data-hero-bridge />

        {/* PROFILE (Phase 2) ────────────────────────── */}
        <Profile />

        {/* PHOTO CONCEPTS (2026-05-26) ──────────────── */}
        <PhotoConcepts />

        {/* REEL (Phase 3) ───────────────────────────── */}
        <Reel />

        {/* ROLES (Phase 4) ──────────────────────────── */}
        <Roles />

        {/* FILMOGRAPHY (Phase 2) ────────────────────── */}
        <Filmography />

        {/* CONTACT (Phase 5) ────────────────────────── */}
        <Contact />
      </main>

      <SiteFooter copyright="© 2026 서해우. All rights reserved." />
    </div>
  );
}
