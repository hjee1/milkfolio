import { AgentTicker } from "./AgentTicker";
import { ReflexTest } from "./ReflexTest";
import styles from "./WhatIDo.module.css";

/**
 * What I Do — the working core of the page.
 *
 * Left column: a tight list of what I actually spend my days on, plainly.
 * Right column: a continuously running agent transcript so the "coding while
 * you scroll" feeling is unmistakable. Below: a single interactive Game of
 * Life for visitors to actually play with.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-001, REQ-DEV-U-003, REQ-DEV-E-003
 */
export function WhatIDo() {
  return (
    <section id="now" className={styles.root}>
      <div className={styles.container} data-reveal>
        <div className={styles.head}>
          <div className={styles.label}>
            <span className={styles.labelNum}>01 / 03</span>
            <span>Now</span>
          </div>
          <h2 className={styles.title}>
            Not a <span className={styles.titleStrike}>data engineer</span> anymore.
            <br />
            Building <em>at the frontier of AI engineering.</em>
          </h2>
        </div>

        <div className={styles.body}>
          <div className={styles.activities}>
            <div className={styles.activityHeader}>// what I&apos;m doing</div>

            <div
              className={styles.activity}
              data-robot-message="Standardizing AI workflows for a whole team! Big responsibility — he LOVES it!"
            >
              <span className={styles.activityMarker}>01</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>AI tech standardization</h3>
                <p className={styles.activityDesc}>
                  At <em>Hanwha Systems&apos; AI Tech Team</em>, turning ad-hoc
                  agent experiments into <code>harness</code> patterns the rest
                  of the org can ship on.
                </p>
              </div>
            </div>

            <div
              className={styles.activity}
              data-robot-message="He reads every release note. EVERY. ONE. The man is RELENTLESS!"
            >
              <span className={styles.activityMarker}>02</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>Frontline research</h3>
                <p className={styles.activityDesc}>
                  Living on <code>Claude Code</code>, <code>MoAI</code>, and
                  compound-engineering workflows. Reading every release note,
                  re-reading the ones that matter, writing back what I learn
                  into the team&apos;s playbook.
                </p>
              </div>
            </div>

            <div
              className={styles.activity}
              data-robot-message="He turns weeks of work into days! That's basically time travel!!"
            >
              <span className={styles.activityMarker}>03</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>Compressing delivery</h3>
                <p className={styles.activityDesc}>
                  Embedding into real projects to <em>cut weeks of plumbing</em>{" "}
                  down to days — proving the harness with code shipped, not
                  slide decks.
                </p>
              </div>
            </div>

            <div
              className={styles.activity}
              data-robot-message="Hanwha Q CELLS! Hanwha Ocean! Hanwha Group SI! He's been EVERYWHERE in the group!"
            >
              <span className={styles.activityMarker}>04</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>Collaborations & track record</h3>
                <p className={styles.activityDesc}>
                  Worked across <em>Hanwha Q CELLS</em>, <em>Hanwha Ocean</em>,
                  and <em>Hanwha Group SI</em> — shipping data platforms on{" "}
                  <code>Databricks</code>, <code>Snowflake</code>,{" "}
                  <code>Cognite CDF</code>, and <code>Airflow</code> running on{" "}
                  <code>Azure AKS</code>.
                </p>
              </div>
            </div>
          </div>

          <div data-robot-message="Shhh! He's coding right now! Watch the magic happen!!">
            <AgentTicker />
          </div>
        </div>

        <div data-robot-message="OH OH OH! Click to play! How fast are YOU? Bet I'm faster!! ⚡">
          <ReflexTest />
        </div>
      </div>
    </section>
  );
}
