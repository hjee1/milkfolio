import { AgentReplay } from "./lab/AgentReplay";
import { CompoundComposer } from "./lab/CompoundComposer";
import { DAGExplorer } from "./lab/DAGExplorer";
import styles from "./Lab.module.css";

/**
 * Lab section — three interactive demonstrations.
 *
 * No external API, no real client data. Every interactive element here is the
 * portfolio itself doing something a static page cannot.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-003, REQ-DEV-N-001
 */
export function Lab() {
  return (
    <section id="lab" className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.label}>
            <span className={styles.labelNum}>03 / 06</span>
            <span>Lab</span>
          </div>
          <div className={styles.intro}>
            <h2 className={styles.title}>
              Three small things that <em>do something.</em>
            </h2>
            <p className={styles.subtitle}>
              Most of my work lives behind NDAs. So instead of screenshotting it,
              I built these — three live demonstrations of the kinds of systems
              I think about every day.
            </p>
            <p className={styles.disclosure}>
              No external API calls. No real client data. Every interaction
              you&apos;re about to have runs in your browser, on this page,
              right now.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <AgentReplay />
          <CompoundComposer />
          <DAGExplorer />
        </div>
      </div>
    </section>
  );
}
