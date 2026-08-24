"use client";

import { useEffect } from "react";

/**
 * ScrollReveal — marks every `[data-reveal]` element with
 * `data-revealed="true"` when it enters the viewport. The consuming route
 * owns the actual transition CSS (each persona styles its own reveal), so
 * this component is style-agnostic and shared across routes.
 *
 * Reduced-motion (or no IntersectionObserver): everything is revealed
 * immediately — no hidden content, no motion.
 */
export function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (els.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.setAttribute("data-revealed", "true"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).setAttribute("data-revealed", "true");
          obs.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return null;
}
