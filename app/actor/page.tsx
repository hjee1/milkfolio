import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "./_components/Hero";
import { Profile } from "./_components/Profile";
import { Filmography } from "./_components/Filmography";
import { PROFILE, NAV_LINKS } from "./data";
import styles from "./page.module.css";

// /actor 페이지 (Phase 2).
// Server Component parent. 6섹션 구조 중 현재 도착한 섹션:
//   ✓ Hero (Phase 1)
//   ✓ bridge (Phase 1)
//   ✓ Profile (Phase 2)
//   ✓ Filmography (Phase 2)
//   ☐ Reel (Phase 3)
//   ☐ Roles (Phase 4)
//   △ Contact (Phase 5에서 새 컴포넌트로 교체 — 현재는 레거시 마크업 유지)
//
// REQ-ACT-N-004 페르소나 분리: 본문(이 페이지에서 렌더되는 모든 텍스트)에
// developer / engineer / IIT / Hanwha / Hyunwoo Jee / 지현우 / Terry (word
// boundary) 등 prohibited substring이 0건이어야 한다. PROFILE.info에서
// 학력·본업이 제거되었고 Profile/Filmography 컴포넌트는 데이터 그대로 렌더
// 한다 — data.ts가 본 페이지의 페르소나 분리 single source of truth이다.
//
// @MX:SPEC: SPEC-ACTOR-REDESIGN-001 Phase 0+1+2
export default function ActorPage() {
  return (
    <div className={styles.body} data-actor-body>
      <SiteNav brand={PROFILE.name} links={NAV_LINKS} />

      {/* HERO ─────────────────────────────────────── */}
      <Hero />

      {/* Hero → body bridge — REQ-ACT-U-009 LOCKED 60~100px gradient */}
      <div className={styles.heroBridge} data-hero-bridge />

      {/* PROFILE (Phase 2) ────────────────────────── */}
      <Profile />

      {/* FILMOGRAPHY (Phase 2) ────────────────────── */}
      <Filmography />

      {/* TODO Phase 3+4: Reel / Roles 섹션을 Filmography 위쪽 또는 사이에
          삽입한다 (Hero → Profile → Reel → Roles → Filmography → Contact가
          최종 순서). Phase 2 시점에는 Profile + Filmography만 활성. */}

      {/* CONTACT (레거시, Phase 5에서 신규 컴포넌트로 교체) ── */}
      <section className={styles.contact} id="contact">
        <div className={`${styles.container} ${styles.contactInner}`}>
          <h2 className={`${styles.sectionTitle} ${styles.center}`}>연락처</h2>
          <p className={styles.contactSub}>
            캐스팅 및 작품 관련 문의는 아래로 연락 주세요.
          </p>
          <div className={styles.contactLinks}>
            <a href="mailto:terryjhw@gmail.com" className={styles.contactLink}>
              terryjhw@gmail.com
            </a>
            <a
              href="https://www.instagram.com/oceanmeetrain"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              @oceanmeetrain
            </a>
          </div>
        </div>
      </section>

      <SiteFooter copyright="© 2026 서해우. All rights reserved." />
    </div>
  );
}
