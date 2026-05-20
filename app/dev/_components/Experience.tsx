import styles from "./Experience.module.css";

/**
 * Experience — career timeline.
 *
 * Tells the data → AI transition plainly. No mythologizing of either chapter:
 * data engineering paid the bills and built the muscle; AI engineering is what
 * I do now because the leverage moved.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-003
 */
export function Experience() {
  return (
    <section id="experience" className={styles.root}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.label}>
            <span className={styles.labelNum}>02 / 03</span>
            <span>Experience</span>
          </div>
          <h2 className={styles.title}>
            How I got <em>here.</em>
          </h2>
        </div>

        <div className={styles.timeline}>
          {/* ── Current chapter ── */}
          <article
            className={styles.entry}
            data-robot-message="He's an AI Engineer NOW! Welcome to the future, friend!"
          >
            <div className={styles.entryPeriod}>
              <span className={styles.now}>now</span>
              <span className={styles.duration}>2026 —</span>
            </div>
            <div className={styles.entryRail}>
              <span className={`${styles.entryDot} ${styles.active}`} />
              <span className={styles.entryLine} />
            </div>
            <div className={styles.entryBody}>
              <h3 className={styles.entryRole}>
                <span className={styles.roleAccent}>AI Engineer</span>
              </h3>
              <p className={styles.entryCompany}>
                Hanwha System · <span className={styles.team}>AI Tech Team</span> · Seoul
              </p>
              <p className={styles.entryDesc}>
                Standardizing how the org ships with AI. Building harness
                patterns on top of <em>Claude Code</em>, <em>MoAI</em>, and
                compound-engineering workflows. Embedding into real projects to
                cut weeks of plumbing down to days. Talking to Mistral AI and
                external studios about what production frontier-model work
                actually looks like.
              </p>
              <div className={styles.entryChips}>
                <span className={`${styles.chip} ${styles.primary}`}>Claude Code</span>
                <span className={`${styles.chip} ${styles.primary}`}>MoAI</span>
                <span className={`${styles.chip} ${styles.primary}`}>Harness Engineering</span>
                <span className={styles.chip}>Compound Engineering</span>
                <span className={styles.chip}>Mistral</span>
                <span className={styles.chip}>TypeScript</span>
                <span className={styles.chip}>Python</span>
              </div>
            </div>
          </article>

          {/* ── Transition note ── */}
          <div className={styles.transition}>
            <span className={styles.transitionLeft}>// turn</span>
            <span className={styles.transitionArrow}>↓</span>
            <span className={styles.transitionBody}>
              moved teams in 2026 — the leverage shifted from{" "}
              <strong>pipelines</strong> to <strong>agents.</strong>
            </span>
          </div>

          {/* ── Previous chapter ── */}
          <article
            className={styles.entry}
            data-robot-message="Four whole years of wrangling big data! That's a LOT of pipelines! He knows his stuff!"
          >
            <div className={styles.entryPeriod}>
              <span>2022 — 2026</span>
              <span className={styles.duration}>~4 yrs</span>
            </div>
            <div className={styles.entryRail}>
              <span className={`${styles.entryDot} ${styles.past}`} />
              <span className={styles.entryLine} />
            </div>
            <div className={styles.entryBody}>
              <h3 className={styles.entryRole}>Data Engineer</h3>
              <p className={styles.entryCompany}>
                Hanwha System · Data Platform · Seoul
              </p>
              <p className={styles.entryDesc}>
                Four years building and running production-grade pipelines
                across the Hanwha group — <em>Hanwha Q CELLS</em>,{" "}
                <em>Hanwha Ocean</em>, and <em>Hanwha Group SI</em>. Shipped on
                Databricks, Snowflake, and Cognite CDF; orchestrated with
                Apache Airflow on Azure AKS (Kubernetes). The muscle that now
                informs how I think about agent systems.
              </p>
              <div className={styles.entryChips}>
                <span className={`${styles.chip} ${styles.primary}`}>Apache Airflow</span>
                <span className={`${styles.chip} ${styles.primary}`}>Databricks</span>
                <span className={`${styles.chip} ${styles.primary}`}>Snowflake</span>
                <span className={`${styles.chip} ${styles.primary}`}>Cognite CDF</span>
                <span className={styles.chip}>Azure AKS</span>
                <span className={styles.chip}>Kubernetes</span>
                <span className={styles.chip}>Spark</span>
                <span className={styles.chip}>Python</span>
                <span className={styles.chip}>SQL</span>
              </div>
            </div>
          </article>

          {/* ── Foundation ── */}
          <article
            className={styles.entry}
            data-robot-message="He went to school in Chicago! Five whole years in the US! That's where his English got so good!"
          >
            <div className={styles.entryPeriod}>
              <span>2016 — 2020</span>
              <span className={styles.duration}>4 yrs</span>
            </div>
            <div className={styles.entryRail}>
              <span className={`${styles.entryDot} ${styles.past}`} />
            </div>
            <div className={styles.entryBody}>
              <h3 className={styles.entryRole}>B.S. Computer Science</h3>
              <p className={styles.entryCompany}>
                Illinois Institute of Technology · Chicago
              </p>
              <p className={styles.entryDesc}>
                Five years in the U.S. before that — the cross-cultural muscle
                that makes working with international labs and English-language
                research feel natural.
              </p>
              <div className={styles.entryChips}>
                <span className={`${styles.chip} ${styles.faded}`}>Computer Science</span>
                <span className={`${styles.chip} ${styles.faded}`}>Algorithms</span>
                <span className={`${styles.chip} ${styles.faded}`}>Systems</span>
              </div>
            </div>
          </article>
        </div>

        <div
          className={styles.languages}
          data-robot-message="Korean! English! Chinese! Japanese! FOUR languages!! My circuits can't even process it!!"
        >
          <span className={styles.languagesLabel}>// languages</span>
          <div className={styles.languagesList}>
            <span className={styles.language}>
              한국어 <span className={styles.level}>native</span>
            </span>
            <span className={styles.language}>
              English <span className={styles.level}>native</span>
            </span>
            <span className={styles.language}>
              中文 <span className={styles.level}>fluent</span>
            </span>
            <span className={styles.language}>
              日本語 <span className={styles.level}>intermediate</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
