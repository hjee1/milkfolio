"use client";

import { useEffect, useState } from "react";

/**
 * 사용자의 `prefers-reduced-data` 설정을 리액티브하게 추적한다.
 *
 * data-saver 모드(또는 명시적 slow connection)를 사용자가 활성화한 경우
 * `true`를 반환한다. Hero `<video>` 자동재생, Reel 탭 전환 시 video preload
 * 등 네트워크를 추가 소비하는 동작을 단락시켜야 한다.
 *
 * SSR-safe: 서버에서는 `false`를 반환하고 hydration 이후 갱신한다. Safari는
 * `prefers-reduced-data` 미디어 쿼리를 부분적으로만 지원하므로 미지원
 * 환경에서는 `false`를 반환한다(데이터 절약 미신호). 이 경우 fallback
 * 동작은 정상 페이지와 동일하다.
 *
 * @MX:NOTE: [AUTO] 이 signal을 honor하는 것은 SPEC-ACTOR-REDESIGN-001
 *           REQ-ACT-S-004 / REQ-ACT-E-007에 따라 HARD requirement이다.
 *           acceptance test E2/B7이 reduced-data 환경에서 hero <video>
 *           자동재생이 비활성화되고 Reel 탭 전환 시 video preload가
 *           차단되는지 검증한다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-S-004, REQ-ACT-E-007
 */
export function usePrefersReducedData(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(prefers-reduced-data: reduce)");
    setPrefersReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    // Safari는 prefers-reduced-data를 미지원하지만 addEventListener 호출은
    // 안전하다 — query.matches가 항상 false이고 change 이벤트는 발화되지
    // 않는다.
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReduced;
}
