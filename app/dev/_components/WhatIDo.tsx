import { AgentTicker } from "./AgentTicker";
import { CompoundComposer } from "./lab/CompoundComposer";
import { DAGExplorer } from "./lab/DAGExplorer";
import styles from "./WhatIDo.module.css";

/**
 * What I Do — the working core of the page.
 *
 * Left column: a tight list of what I actually spend my days on, written
 * plainly. Right column: a continuously running agent transcript so the
 * "coding while you scroll" feeling is unmistakable. Below: two small,
 * touchable demos (Compound + DAG) that let visitors poke at the abstract
 * ideas mentioned in the activity list.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-001, REQ-DEV-U-003, REQ-DEV-E-003
 */
export function WhatIDo() {
  return (
    <section id="now" className={styles.root}>
      <div className={styles.container}>
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

            <div className={styles.activity}>
              <span className={styles.activityMarker}>01</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>AI tech standardization</h3>
                <p className={styles.activityDesc}>
                  Leading the <em>AI Tech Team</em> at Hanwha System. Turning
                  ad-hoc agent experiments into <code>harness</code> patterns
                  the whole org can ship on.
                </p>
              </div>
            </div>

            <div className={styles.activity}>
              <span className={styles.activityMarker}>02</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>Frontline research</h3>
                <p className={styles.activityDesc}>
                  Living on <code>Claude Code</code>, <code>MoAI</code>, and
                  compound-engineering workflows. Reading every release note,
                  re-reading the ones that matter, writing back what I learn.
                </p>
              </div>
            </div>

            <div className={styles.activity}>
              <span className={styles.activityMarker}>03</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>Compressing delivery</h3>
                <p className={styles.activityDesc}>
                  Embedding into real projects to <em>cut weeks of plumbing</em>{" "}
                  down to days — proving the harness with code shipped, not slide
                  decks.
                </p>
              </div>
            </div>

            <div className={styles.activity}>
              <span className={styles.activityMarker}>04</span>
              <div className={styles.activityBody}>
                <h3 className={styles.activityTitle}>Outside collaborations</h3>
                <p className={styles.activityDesc}>
                  Talking to international labs (<em>Mistral AI</em>) and
                  external studios about what shipping with frontier models
                  actually looks like in production.
                </p>
              </div>
            </div>
          </div>

          <AgentTicker />
        </div>

        <div className={styles.minis}>
          <div className={styles.mini}>
            <div className={styles.miniBar}>
              <span className={styles.miniBarDot} />
              <span>compound</span>
              <span className={styles.miniBarSpacer} />
              <span className={styles.miniBarMeta}>3 axes · 27 systems</span>
            </div>
            <div className={styles.miniBody}>
              <h3 className={styles.miniTitle}>Three knobs, twenty-seven systems.</h3>
              <p className={styles.miniDesc}>
                Pick a signal shape, a depth, a freshness budget. The result is
                always a system you&apos;d actually have to build.
              </p>
              <div className={styles.miniCanvas}>
                <CompoundComposer />
              </div>
            </div>
          </div>

          <div className={styles.mini}>
            <div className={styles.miniBar}>
              <span className={styles.miniBarDot} />
              <span>topology</span>
              <span className={styles.miniBarSpacer} />
              <span className={styles.miniBarMeta}>drag · or tab + arrows</span>
            </div>
            <div className={styles.miniBody}>
              <h3 className={styles.miniTitle}>The shape of a pipeline.</h3>
              <p className={styles.miniDesc}>
                Six abstract stages, eight directed edges, packets flowing
                between them. Drag the nodes — the topology survives.
              </p>
              <div className={styles.miniCanvas}>
                <DAGExplorer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
