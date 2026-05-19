"use client";

import { useEffect, useState } from "react";
import { useBuildInfo } from "./shared/useBuildInfo";
import { useFPS } from "./shared/useFPS";
import styles from "./Craft.module.css";

/**
 * Craft section — meta self-reference.
 *
 * Every metric in this panel describes the page the visitor is currently
 * looking at: deploy lineage, runtime health, page weight, browser support.
 * The portfolio is the artifact; this is the spec sheet for that artifact.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-005, REQ-DEV-O-001
 */
export function Craft() {
  const { sha, age, buildTime } = useBuildInfo();
  const fps = useFPS();
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [fontReady, setFontReady] = useState(false);
  const [pageWeight, setPageWeight] = useState<string>("measuring…");

  useEffect(() => {
    if (typeof document === "undefined") return;
    if ("fonts" in document) {
      document.fonts.ready.then(() => setFontReady(true));
    } else {
      setFontReady(true);
    }
  }, []);

  useEffect(() => {
    if (fps <= 0) return;
    setFpsHistory((prev) => {
      const next = [...prev, fps];
      return next.slice(-24);
    });
  }, [fps]);

  useEffect(() => {
    if (typeof performance === "undefined" || !("getEntriesByType" in performance)) return;
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const total = resources.reduce((sum, r) => sum + (r.transferSize ?? 0), 0);
    if (total > 0) {
      const kb = total / 1024;
      setPageWeight(kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(0)} KB`);
    }
  }, [fontReady]);

  const peakFps = fpsHistory.length ? Math.max(...fpsHistory) : 0;
  const avgFps = fpsHistory.length
    ? Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length)
    : 0;
  const sparkMax = Math.max(60, peakFps);

  const buildLocal = buildTime
    ? new Date(buildTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : "local-dev";

  return (
    <section id="craft" className={styles.root}>
      <div className={styles.container}>
        <div className={styles.label}>
          <span className={styles.labelNum}>04 / 06</span>
          <span>Craft</span>
          <h2 className={styles.labelHead}>This page, observed.</h2>
          <p className={styles.labelHint}>
            Every number you see here describes the page you&apos;re currently
            looking at. Refresh to reset the FPS window.
          </p>
        </div>

        <div>
          <div className={styles.panel}>
            <div className={styles.titlebar}>
              <span className={styles.titledot} />
              <span>milkfolio.dev — live telemetry</span>
              <span className={styles.titlecaret}>/dev</span>
            </div>
            <div className={styles.body}>
              <div className={styles.row}>
                <span className={styles.rowKey}>commit</span>
                <span className={`${styles.rowValue} ${styles.accent}`}>{sha}</span>
                <span className={styles.rowAnnotation}>main</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>deployed</span>
                <span className={styles.rowValue}>{buildLocal}</span>
                <span className={styles.rowAnnotation}>{age}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>route</span>
                <span className={styles.rowValue}>/dev</span>
                <span className={styles.rowAnnotation}>RSC + Client</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.sectionHeader}>// runtime</div>
              <div className={styles.row}>
                <span className={styles.rowKey}>fps</span>
                <span className={`${styles.rowValue} ${styles.accent}`}>
                  {fps > 0 ? fps : "—"}
                </span>
                <span className={styles.rowAnnotation}>
                  {fpsHistory.length > 0
                    ? `avg ${avgFps} · peak ${peakFps}`
                    : "warming up"}
                </span>
              </div>
              {fpsHistory.length > 1 && (
                <div className={styles.sparkline} aria-hidden="true">
                  {fpsHistory.map((v, i) => (
                    <div
                      key={i}
                      className={styles.sparkbar}
                      style={{ height: `${Math.max(2, (v / sparkMax) * 100)}%` }}
                    />
                  ))}
                </div>
              )}
              <div className={styles.row}>
                <span className={styles.rowKey}>fonts</span>
                <span className={styles.rowValue}>
                  {fontReady ? "loaded" : "loading"}
                </span>
                <span className={styles.rowAnnotation}>
                  grotesk · inter · mono
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>weight</span>
                <span className={styles.rowValue}>{pageWeight}</span>
                <span className={styles.rowAnnotation}>transferred</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.sectionHeader}>// architecture</div>
              <div className={styles.row}>
                <span className={styles.rowKey}>framework</span>
                <span className={styles.rowValue}>Next.js 16.2.6</span>
                <span className={styles.rowAnnotation}>App Router · RSC</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>ui</span>
                <span className={styles.rowValue}>React 19.2.6</span>
                <span className={styles.rowAnnotation}>
                  Server + Client Components
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>hero</span>
                <span className={styles.rowValue}>Three.js 0.184 + R3F 9.6</span>
                <span className={styles.rowAnnotation}>lazy · dynamic</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>style</span>
                <span className={styles.rowValue}>Tailwind 4 + CSS Modules</span>
                <span className={styles.rowAnnotation}>per-route tokens</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>typecheck</span>
                <span className={`${styles.rowValue} ${styles.accent}`}>
                  strict
                </span>
                <span className={styles.rowAnnotation}>0 errors</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowKey}>hosting</span>
                <span className={styles.rowValue}>Vercel</span>
                <span className={styles.rowAnnotation}>edge · auto-deploy</span>
              </div>
            </div>
          </div>

          <p className={styles.note}>
            // <em>What you see is the deliverable.</em> No screenshots of
            other people&apos;s work. No NDA-rotting case studies. Just this
            page, instrumented and accountable.
          </p>
        </div>
      </div>
    </section>
  );
}
