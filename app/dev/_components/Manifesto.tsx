import styles from "./Manifesto.module.css";

/**
 * Manifesto / Now section.
 *
 * Editorial declaration of who Hyunwoo is RIGHT NOW — not a job-history dump.
 * Three things: the strike-through framing of the old identity, the current
 * frontier of practice, and a small "now playing" list of concrete activities.
 *
 * Plain server component. The motion is sparse and CSS-driven — no Framer
 * Motion needed; the page already pays a runtime cost for the hero R3F bundle.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-001, REQ-DEV-U-003
 */
export function Manifesto() {
  return (
    <section id="manifesto" className={styles.root}>
      <div className={styles.container}>
        <div className={styles.label}>
          <span className={styles.labelNum}>01 / 06</span>
          <span>Now</span>
        </div>

        <div className={styles.body}>
          <h2 className={styles.heading}>
            Not a <span className={styles.strike}>data engineer</span> anymore.
            <br />
            Building <em>at the frontier of AI engineering.</em>
          </h2>

          <p className={styles.lede}>
            I lead AI tech standardization at <strong>Hanwha System&apos;s AI Tech Team</strong> —
            researching the frontier of harness engineering and turning emerging
            patterns into production-grade workflows that compress project timelines.
          </p>

          <div className={styles.now}>
            <div className={styles.nowHeader}>// now playing</div>

            <div className={styles.nowItem}>
              <span className={styles.nowMarker}>01</span>
              <span className={styles.nowText}>
                Standardizing AI development with <code>Claude Code</code>,{" "}
                <code>MoAI</code>, and <em>compound engineering</em> patterns —
                lowering the floor between an idea and a shippable agent.
              </span>
            </div>

            <div className={styles.nowItem}>
              <span className={styles.nowMarker}>02</span>
              <span className={styles.nowText}>
                Composing <em>harness toolchains</em> that let small teams take on
                work that used to require weeks of plumbing.
              </span>
            </div>

            <div className={styles.nowItem}>
              <span className={styles.nowMarker}>03</span>
              <span className={styles.nowText}>
                Collaborating with international AI labs and external studios on
                what shipping with frontier models actually looks like.
              </span>
            </div>

            <div className={styles.nowItem}>
              <span className={styles.nowMarker}>04</span>
              <span className={styles.nowText}>
                Reading every release note. Re-reading the ones that matter.
                Writing what I learn back into the team&apos;s playbook.
              </span>
            </div>
          </div>

          <p className={styles.pullquote}>
            I won&apos;t show you what I&apos;ve built.
            <br />I&apos;ll show you what I can build.
            <br />
            <em style={{ color: "#38d9ff", fontStyle: "normal" }}>This page.</em>
          </p>
        </div>
      </div>
    </section>
  );
}
