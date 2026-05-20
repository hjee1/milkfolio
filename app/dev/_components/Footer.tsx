"use client";

import { useEffect, useState } from "react";
import { useBuildInfo } from "./shared/useBuildInfo";
import { useFPS } from "./shared/useFPS";
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
  const { sha, age } = useBuildInfo();
  const fps = useFPS();
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
    const id = setTimeout(compute, 1500); // Re-read once more after lazy chunks land.
    return () => clearTimeout(id);
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
            >
              <span className={styles.channelLabel}>linkedin</span>
              hyunwoo-jee
            </a>
            <span className={styles.availability}>open to collaborations</span>
          </div>
        </div>

        <div className={styles.telemetry} aria-label="Live page telemetry">
          <span className={styles.telemetryLabel}>// live</span>
          <span className={`${styles.telemetryItem} ${styles.live}`}>
            <span className={styles.telKey}>fps</span>
            <span className={`${styles.telValue} ${styles.accent}`}>
              {fps > 0 ? fps : "—"}
            </span>
          </span>
          <span className={styles.telemetryItem}>
            <span className={styles.telKey}>commit</span>
            <span className={styles.telValue}>{sha}</span>
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
