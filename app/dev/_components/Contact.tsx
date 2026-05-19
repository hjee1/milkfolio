import styles from "./Contact.module.css";

/**
 * Contact section — minimalist closing.
 *
 * Big confident statement, availability dot, two channels. No /actor
 * cross-link (REQ-DEV-N-004 — keep professional identities separate).
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-N-004
 */
export function Contact() {
  return (
    <section id="contact" className={styles.root}>
      <div className={styles.container}>
        <div>
          <p className={styles.label}>05 / 06 — Contact</p>
          <h2 className={styles.heading}>
            Let&apos;s build
            <br />
            <em>something real.</em>
          </h2>
          <p className={styles.sub}>
            Open to AI engineering collaborations, harness consulting, and
            partnerships with teams who treat shipping as a craft.
          </p>
          <p className={styles.availability}>available · responds within 24h</p>
        </div>

        <div className={styles.links}>
          <a
            href="mailto:terryjhw@gmail.com"
            className={styles.link}
            aria-label="Send email to terryjhw@gmail.com"
          >
            <span className={styles.linkIcon} aria-hidden="true">
              ✉
            </span>
            <span className={styles.linkText}>
              <span className={styles.linkLabel}>email</span>
              <span className={styles.linkValue}>terryjhw@gmail.com</span>
            </span>
            <span className={styles.linkArrow} aria-hidden="true">
              →
            </span>
          </a>
          <a
            href="https://linkedin.com/in/hyunwoo-jee-79b981189"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="View LinkedIn profile (opens new tab)"
          >
            <span className={styles.linkIcon} aria-hidden="true">
              ↗
            </span>
            <span className={styles.linkText}>
              <span className={styles.linkLabel}>linkedin</span>
              <span className={styles.linkValue}>hyunwoo-jee-79b981189</span>
            </span>
            <span className={styles.linkArrow} aria-hidden="true">
              →
            </span>
          </a>
          <a
            href="https://github.com/hjee1"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="View GitHub profile (opens new tab)"
          >
            <span className={styles.linkIcon} aria-hidden="true">
              ⌥
            </span>
            <span className={styles.linkText}>
              <span className={styles.linkLabel}>github</span>
              <span className={styles.linkValue}>hjee1</span>
            </span>
            <span className={styles.linkArrow} aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 Hyunwoo Jee · this page is the portfolio</span>
          <span>
            built with{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              next.js
            </a>{" "}
            · deployed on{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              vercel
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
