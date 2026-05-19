"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the user's OS-level `prefers-reduced-motion` setting reactively.
 *
 * Returns `true` when the user has requested reduced motion. All animation-driving
 * components MUST short-circuit on `true` — no `useFrame`, no auto-play, no
 * scroll-triggered transitions. Static content should still render.
 *
 * SSR-safe: returns `false` on the server (assumes full motion) and then
 * upgrades after hydration. This prevents layout flicker since the static
 * fallback markup is also what reduced-motion users see.
 *
 * @MX:NOTE: Honor of this signal is HARD per SPEC-DEV-REDESIGN-001 REQ-DEV-S-001.
 *           Acceptance test C1 verifies that WebGL stops and Motion variants
 *           do not auto-play when this returns true.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    // Modern API; both Chromium and Safari ≥14 support addEventListener on MQL.
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}
