"use client";

import { useEffect, useState } from "react";

export interface BuildInfo {
  /** Short commit SHA (7 chars) or `local-dev` when unavailable. */
  sha: string;
  /** ISO timestamp of the build, or null when unavailable. */
  buildTime: string | null;
  /** Human-readable age (e.g., "3h ago", "2d ago", "just now"). Recomputes each minute. */
  age: string;
}

/**
 * Reads BUILD_SHA + BUILD_TIME constants injected by next.config.ts env() and
 * derives a human-readable age that auto-refreshes once per minute.
 *
 * Both values are inlined at build time, so the read is synchronous and free.
 * The hook exists for two reasons:
 *   1) Encapsulate the fallback ("local-dev", null age) so call sites stay clean.
 *   2) Tick the `age` string on a 60s interval so stale "3h ago" doesn't lie.
 *
 * @MX:NOTE: Drives REQ-DEV-O-001 (Craft section live metadata) and the Hero
 *           system board overlay. Returns sentinel string `"local-dev"` outside Vercel.
 */
export function useBuildInfo(): BuildInfo {
  const sha = process.env.BUILD_SHA ?? "local-dev";
  const buildTime = process.env.BUILD_TIME ?? null;

  const [age, setAge] = useState(() => formatAge(buildTime));

  useEffect(() => {
    if (!buildTime) return;
    const tick = () => setAge(formatAge(buildTime));
    tick(); // Recompute on hydration in case SSR rendered "0s ago".
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [buildTime]);

  return { sha, buildTime, age };
}

function formatAge(iso: string | null): string {
  if (!iso) return "local";
  const built = Date.parse(iso);
  if (Number.isNaN(built)) return "unknown";

  const diffMs = Date.now() - built;
  if (diffMs < 0) return "just now"; // Clock skew guard.

  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon}mo ago`;
  return `${Math.floor(mon / 12)}y ago`;
}
