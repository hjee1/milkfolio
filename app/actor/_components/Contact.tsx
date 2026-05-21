import styles from "./Contact.module.css";

/**
 * /actor Contact — 캐스팅 inquiry (Server Component).
 *
 * 6 섹션 구조의 마지막 섹션. Hero → Profile → Reel → Roles → Filmography →
 * Contact 순. 매거진 디지털 커버의 closing page에 해당하는 톤으로, 큰
 * Cormorant 매거진 헤드라인 `C A S T   I N Q U I R Y` + 한국어 lead 1줄 +
 * 메일·인스타 2개 링크만 가지는 정적 마크업이다.
 *
 * 헤딩 위계 (Phase 0+1 LD1):
 *   - Hero가 h1 단독 보유
 *   - Contact 섹션 헤드라인은 h2 (`C A S T   I N Q U I R Y`)
 *
 * 페르소나 분리 (REQ-ACT-N-004): 본 컴포넌트의 모든 텍스트는 정적이며
 * prohibited substring(IIT / Hanwha / developer / engineer / Terry word
 * boundary / 지현우 …) 0건이 작성 시점에 확정된다. 이메일
 * `terryjhw@gmail.com`은 캐스팅 contact으로 허용 (word boundary 검증을
 * 통과하므로 'Terry' 단독 노출이 아니다).
 *
 * 톤:
 *   - eyebrow: gold-on-light (`accentGold` #7c6240) small caps (REQ-ACT-U-011)
 *   - h2: Cormorant 큼, 넓은 자간으로 매거진 표제 효과
 *   - lead: Pretendard, ink.soft, 1줄
 *   - 이메일: Cormorant 중형으로 강조
 *   - 인스타: 보조 라벨 + 핸들
 *   - emoji 0건 (REQ-ACT-N-008) — 레거시 ✉ / 📷 글리프 제거
 *
 * @MX:NOTE: [AUTO] 정적 캐스팅 contact. mailto + instagram 2개 링크만.
 *           변경 빈도 낮음. SSR-only, 클라이언트 JS 0.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001, REQ-ACT-U-002,
 *           REQ-ACT-U-008, REQ-ACT-U-011, REQ-ACT-N-004, REQ-ACT-N-008
 */
export function Contact() {
  return (
    <section
      id="contact"
      className={styles.root}
      aria-labelledby="contact-heading"
    >
      <div className={styles.container}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Contact</p>
          <h2 id="contact-heading" className={styles.title}>
            C A S T &nbsp; I N Q U I R Y
          </h2>
          <p className={styles.lead}>
            캐스팅 및 작품 문의를 환영합니다.
          </p>
        </header>

        <hr className={styles.rule} aria-hidden="true" />

        <ul className={styles.links} aria-label="연락처">
          <li className={styles.linkRow}>
            <span className={styles.linkLabel}>Email</span>
            <a
              className={styles.emailLink}
              href="mailto:terryjhw@gmail.com"
            >
              terryjhw@gmail.com
            </a>
          </li>
          <li className={styles.linkRow}>
            <span className={styles.linkLabel}>Instagram</span>
            <a
              className={styles.handleLink}
              href="https://www.instagram.com/oceanmeetrain"
              target="_blank"
              rel="noopener noreferrer"
            >
              @oceanmeetrain
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
