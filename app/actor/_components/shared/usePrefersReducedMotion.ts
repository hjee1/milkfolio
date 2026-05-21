"use client";

import { useEffect, useState } from "react";

/**
 * 사용자의 OS 레벨 `prefers-reduced-motion` 설정을 리액티브하게 추적한다.
 *
 * 사용자가 reduced motion을 요청했을 때 `true`를 반환한다. Hero 자동재생,
 * ken-burns, character card flip transform 등 모든 모션 구동 컴포넌트는
 * 이 값이 `true`일 때 단락(short-circuit)되어야 한다 — 자동재생 금지,
 * scroll-triggered transition 금지. 정적 콘텐츠는 계속 렌더한다.
 *
 * SSR-safe: 서버에서는 `false`(풀 모션 가정)를 반환하고 hydration 이후
 * 갱신한다. 정적 fallback 마크업이 reduced-motion 사용자가 보는 것과
 * 같으므로 layout flicker가 발생하지 않는다.
 *
 * @MX:NOTE: [AUTO] 이 signal을 honor하는 것은 SPEC-ACTOR-REDESIGN-001
 *           REQ-ACT-S-001에 따라 HARD requirement이다. acceptance test
 *           E1이 reduced-motion 환경에서 hero 자동재생·ken-burns·card flip
 *           transform이 비활성화되는지 검증한다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-S-001
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

    // Modern API: Chromium·Safari ≥14는 MQL에서 addEventListener를 지원한다.
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}
