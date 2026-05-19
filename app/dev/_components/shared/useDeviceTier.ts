"use client";

import { useEffect, useState } from "react";
import { BREAKPOINT_MOBILE, BREAKPOINT_TABLET, type DeviceTier } from "./tokens";

/**
 * Returns the current device tier based on viewport width.
 *
 * - mobile:  width < 768
 * - tablet:  768 <= width < 1024
 * - desktop: width >= 1024
 *
 * Components use this to scale WebGL particle counts, swap Lab layouts,
 * and gate expensive animations. Re-evaluates on resize.
 *
 * SSR-safe: defaults to `desktop` on the server. The first client effect
 * snaps to the real value before paint.
 *
 * @MX:NOTE: Drives REQ-DEV-S-002 — viewport < 768 must reduce particles ≥50%.
 *           Mobile fallback also simplifies Lab demo affordances.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("desktop");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const compute = (): DeviceTier => {
      const w = window.innerWidth;
      if (w < BREAKPOINT_MOBILE) return "mobile";
      if (w < BREAKPOINT_TABLET) return "tablet";
      return "desktop";
    };

    setTier(compute());

    let rafId = 0;
    const onResize = () => {
      // rAF debounce — resize fires storms during window drags.
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setTier(compute());
      });
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return tier;
}
