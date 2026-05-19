"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures the page's rolling render FPS via `requestAnimationFrame`.
 *
 * Updates the returned value once per second — that's the cadence the Craft
 * section displays. Sampling every frame would itself become a perf cost and
 * the user can't read a number that flickers 60 times a second anyway.
 *
 * Auto-pauses the rAF loop when the page is hidden (`visibilitychange`) so
 * background tabs don't keep ticking, and resumes on focus. Disposes cleanly
 * on unmount.
 *
 * @MX:NOTE: Live telemetry for REQ-DEV-E-005 + H2 acceptance.
 *           The number must change over time — acceptance test H2 verifies it
 *           is not a static value.
 * @MX:WARN: This hook runs a permanent rAF loop while the component is mounted
 *           and the document is visible. Keep usage to the single Craft section
 *           consumer; do not multiply across components.
 * @MX:REASON: Multiple concurrent rAF loops would compound work each frame and
 *             skew the very measurement they report.
 */
export function useFPS(): number {
  const [fps, setFps] = useState(0);
  const frameTimes = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastReportRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let stopped = false;

    const tick = (now: number) => {
      if (stopped) return;

      const times = frameTimes.current;
      times.push(now);
      // Keep the rolling window to ~2 seconds (max 240 entries at 120Hz).
      const cutoff = now - 2000;
      while (times.length && times[0] < cutoff) times.shift();

      // Report once per second.
      if (now - lastReportRef.current >= 1000 && times.length > 1) {
        const elapsedSec = (times[times.length - 1] - times[0]) / 1000;
        const measured = elapsedSec > 0 ? (times.length - 1) / elapsedSec : 0;
        setFps(Math.round(measured));
        lastReportRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafIdRef.current != null) return;
      lastReportRef.current = performance.now();
      frameTimes.current = [];
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      stopped = true;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        stopped = false;
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return fps;
}
