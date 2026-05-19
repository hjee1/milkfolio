"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HeroFallback } from "./HeroFallback";
import styles from "./Hero.module.css";

/**
 * Lazy-loaded wrapper around HeroCanvas. Keeps Three.js out of the initial
 * route bundle and renders a static SVG fallback either while the chunk is
 * fetching or when the device lacks WebGL2 support.
 *
 * @MX:NOTE: Pairs with HeroFallback to satisfy REQ-DEV-O-002 (WebGL2 fallback)
 *           and REQ-DEV-O-003 (R3F via dynamic import only).
 */
const HeroCanvas = dynamic(() => import("./HeroCanvas").then((m) => m.HeroCanvas), {
  ssr: false,
  loading: () => <HeroFallback />,
});

export function HeroVisual() {
  const [webgl2Supported, setWebgl2Supported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl2Supported(detectWebGL2());
  }, []);

  // Pre-detection (SSR + first paint): show fallback. This is what the dynamic
  // `loading` prop also returns, so there is no flicker.
  if (webgl2Supported === null) {
    return (
      <div className={styles.visual} aria-hidden="true">
        <HeroFallback />
      </div>
    );
  }

  if (!webgl2Supported) {
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
