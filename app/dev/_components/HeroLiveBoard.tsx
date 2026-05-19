"use client";

import { useEffect, useState } from "react";
import { useBuildInfo } from "./shared/useBuildInfo";
import { useFPS } from "./shared/useFPS";
import styles from "./Hero.module.css";

/**
 * Terminal-style live status panel anchored to the hero corner.
 * Surfaces four signals about THIS page so the visitor sees the portfolio
 * itself behaving like the systems it talks about: deployed code, current
 * runtime health, font load state.
 *
 * @MX:NOTE: Pairs with Craft section's denser telemetry — Hero shows just
 *           enough to register "this thing is alive" at first glance.
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-005, REQ-DEV-O-001
 */
export function HeroLiveBoard() {
  const { sha, age } = useBuildInfo();
  const fps = useFPS();
  const fontsLoaded = useFontsLoaded();

  return (
    <aside className={styles.board} aria-label="Live system status">
      <div className={styles.boardHeader}>SYSTEM · LIVE</div>
      <div className={styles.boardRow}>
        <span className={styles.boardKey}>commit</span>
        <span className={styles.boardValue}>{sha}</span>
      </div>
      <div className={styles.boardRow}>
        <span className={styles.boardKey}>deployed</span>
        <span className={styles.boardValue}>{age}</span>
      </div>
      <div className={styles.boardRow}>
        <span className={styles.boardKey}>render</span>
        <span className={styles.boardValue}>{fps > 0 ? `${fps} fps` : "warming up"}</span>
      </div>
      <div className={styles.boardRow}>
        <span className={styles.boardKey}>fonts</span>
        <span className={styles.boardValue}>{fontsLoaded ? "ready" : "loading"}</span>
      </div>
    </aside>
  );
}

/**
 * Observes the document's webfont loading status. Returns `true` once all
 * registered font faces have finished loading (or failed gracefully).
 */
function useFontsLoaded(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) {
      setLoaded(true); // Be optimistic when the API is unavailable.
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return loaded;
}
