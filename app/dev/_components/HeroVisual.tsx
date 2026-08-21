"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HeroFallback } from "./HeroFallback";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import styles from "./Hero.module.css";

/**
 * Lazy-loaded wrapper around HeroCanvas. Keeps Three.js out of the initial
 * route bundle and renders a static SVG fallback while the chunk is fetching,
 * when the device lacks WebGL2 support, or when the visitor prefers reduced
 * motion (the animated canvas would only idle — skip the chunk entirely).
 *
 * @MX:NOTE: Pairs with HeroFallback to satisfy REQ-DEV-O-002 (WebGL2 fallback)
 *           and REQ-DEV-O-003 (R3F via dynamic import only).
 */
const HeroCanvas = dynamic(() => import("./HeroCanvas").then((m) => m.HeroCanvas), {
  ssr: false,
  loading: () => <HeroFallback />,
});

export function HeroVisual() {
  const reducedMotion = usePrefersReducedMotion();
  const [webgl2Supported, setWebgl2Supported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl2Supported(detectWebGL2());
  }, []);

  // Pre-detection (SSR + first paint): show fallback. This is what the dynamic
  // `loading` prop also returns, so there is no flicker. Reduced-motion users
  // stay on the fallback permanently — no Three.js download for a still image.
  if (webgl2Supported === null || !webgl2Supported || reducedMotion) {
    return (
      <div className={styles.visual} aria-hidden="true">
        <HeroFallback />
      </div>
    );
  }

  return (
    <div className={styles.visual} aria-hidden="true">
      <HeroCanvas />
    </div>
  );
}

function detectWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl2");
    return ctx != null;
  } catch {
    return false;
  }
}
