"use client";

import { useEffect, useState } from "react";
import { useBuildInfo } from "./shared/useBuildInfo";
import styles from "./Footer.module.css";

/**
 * Footer — compact contact band + inline live telemetry.
 *
 * The whole page has been making the "let's talk" case; the footer just gives
 * the channels and the live page-health readout so visitors leave on the same
 * "this thing is alive" note.
 *
 * GitHub channel deliberately omitted (per user direction).
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-005, REQ-DEV-O-001, REQ-DEV-N-004
 */
export function Footer() {
  // FPS deliberately not measured here — useFPS runs a rAF loop and its
  // @MX:WARN caps usage at one consumer (HeroLiveBoard). One live readout
  // per page is enough; two independent loops showed diverging numbers.
  const { sha, age } = useBuildInfo();
  const [pageWeight, setPageWeight] = useState<string>("—");

  useEffect(() => {
    if (typeof performance === "undefined" || !("getEntriesByType" in performance)) return;
    const compute = () => {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const total = resources.reduce((sum, r) => sum + (r.transferSize ?? 0), 0);
      if (total > 0) {
        const kb = total / 1024;
        setPageWeight(kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(0)} KB`);
      }
    };
    compute();
    // Re-read after lazy chunks land — the three.js chunk (~885KB) often
    // arrives past 1.5s, so sample again later to stop under-reporting.
    const t1 = setTimeout(compute, 1500);
    const t2 = setTimeout(compute, 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <footer id="contact" className={styles.root}>
      <div className={styles.container}>
        <div className={styles.contact}>
          <p className={styles.lead}>
            Talk to me <em>about AI</em>, harness work, or both.
          </p>
          <div className={styles.channels}>
            <a
              href="mailto:terryjhw@gmail.com"
              className={styles.channel}
              aria-label="Send email"
              data-robot-message="Email is the easiest way! He responds fast — promise!"
            >
              <span className={styles.channelLabel}>email</span>
              terryjhw@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/hyunwoo-jee-79b981189"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channel}
              aria-label="View LinkedIn profile"
              data-robot-message="His professional network! All the cool kids are there!"
            >
              <span className={styles.channelLabel}>linkedin</span>
              hyunwoo-jee
            </a>
            <span className={styles.availability}>open to collaborations</span>
          </div>
        </div>

        <div
          className={styles.telemetry}
          aria-label="Live page telemetry"
          data-robot-message="LOOK! Real live stats! The page is breathing! It's ALIVE!! 🫀"
        >
          <span className={styles.telemetryLabel}>// live</span>
          <span className={`${styles.telemetryItem} ${styles.live}`}>
            <span className={styles.telKey}>commit</span>
            <span className={`${styles.telValue} ${styles.accent}`}>{sha}</span>
          </span>
          <span className={styles.telemetryItem}>
            <span className={styles.telKey}>deployed</span>
            <span className={styles.telValue}>{age}</span>
          </span>
          <span className={styles.telemetryItem}>
            <span className={styles.telKey}>weight</span>
            <span className={styles.telValue}>{pageWeight}</span>
          </span>
          <span className={styles.telemetrySpacer} />
          <span className={styles.telemetryItem}>
            <span className={styles.telKey}>route</span>
            <span className={styles.telValue}>/dev</span>
          </span>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 Hyunwoo Jee · this page is the portfolio</span>
          <span>
            built with{" "}
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
              next.js
            </a>{" "}
            +{" "}
            <a href="https://threejs.org" target="_blank" rel="noopener noreferrer">
              three.js
            </a>{" "}
            · deployed on{" "}
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              vercel
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
