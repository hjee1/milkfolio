"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroReel.module.css";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import { usePrefersReducedData } from "./shared/usePrefersReducedData";

type HeroReelProps = {
  /** 정적 portrait poster — reel 영상 미입수 시 단독 표시, 입수 후 video poster */
  posterImage: string;
  /** 자체 호스팅 reel URL. 빈 문자열/undefined면 video는 마크업에 예약만 됨 */
  reelUrl?: string;
};

/**
 * /actor Hero의 배경 비주얼 레이어 (Client Component).
 *
 * 핵심 contract (REQ-ACT-O-001): `<video>` 요소는 항상 DOM에 예약된다.
 * `reelUrl`이 비어 있으면 src 없이 hidden 상태로 유지되고 정적 portrait가
 * 단독 표시된다. URL이 채워지면 markup 변경 없이 src 주입만으로 활성된다.
 * 따라서 사용자가 academy 모놀로그 클립 편집 후 `HERO.reelUrl`만 페이스트
 * 하면 자동으로 video가 활성된다.
 *
 * 비주얼 효과:
 * - film grain overlay (CSS SVG feTurbulence noise, ~7% opacity)
 * - 미세 ken-burns 애니메이션 (scale 1.0 → 1.05 over 20s alternate)
 *
 * 접근성:
 * - prefers-reduced-motion → ken-burns 정지 + autoplay 차단 (REQ-ACT-S-001)
 * - prefers-reduced-data  → autoplay 차단, poster만 표시 (REQ-ACT-S-004)
 *
 * @MX:ANCHOR: [AUTO] Hero placeholder ↔ video 활성 contract의 진입점.
 *             HERO.reelUrl 유무로 video 활성을 분기하는 단일 지점이며
 *             Hero, page.tsx, layout 등 여러 캐스트에서 호출된다 (fan_in≥3).
 *             SSR/CSR 분기와 hydration mismatch 위험이 집중되는 핵심.
 * @MX:REASON: 이 컴포넌트가 깨지면 Hero 전체가 비주얼적으로 무너지고
 *             reel 활성 contract(REQ-ACT-O-001/E-006)도 동시에 깨진다.
 *             변경 시 SSR/CSR 동시 동작 + reduced-motion/data fallback을
 *             반드시 함께 검증해야 한다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-O-001, REQ-ACT-E-006,
 *           REQ-ACT-S-001, REQ-ACT-S-004
 */
export function HeroReel({ posterImage, reelUrl }: HeroReelProps) {
  const reducedMotion = usePrefersReducedMotion();
  const reducedData = usePrefersReducedData();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // reel이 활성된 상태에서 reduced-motion/data로 전환되면 즉시 일시정지.
  // reelUrl이 비어 있는 동안은 src도 없으므로 어차피 재생되지 않는다.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!reelUrl) return;
    if (reducedMotion || reducedData) {
      video.pause();
    }
  }, [reducedMotion, reducedData, reelUrl]);

  const hasReel = Boolean(reelUrl);
  const allowAutoplay = hasReel && !reducedMotion && !reducedData;
  const allowKenBurns = !hasReel && !reducedMotion;

  return (
    <div className={styles.root} aria-hidden="true">
      {/* 정적 portrait — 항상 렌더. video 활성 시에는 poster 역할로 강등 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterImage}
        alt=""
        className={`${styles.poster} ${
          allowKenBurns ? styles.posterKenBurns : ""
        }`}
        loading="eager"
        fetchPriority="high"
      />

      {/* <video> 마크업 예약 — REQ-ACT-O-001. reelUrl 비어 있으면 hidden */}
      <video
        ref={videoRef}
        className={styles.video}
        // src는 reelUrl이 있을 때만 부여 — 빈 src로 인한 fetch 에러 차단
        {...(hasReel ? { src: reelUrl } : {})}
        poster={posterImage}
        muted
        playsInline
        loop
        preload="none"
        autoPlay={allowAutoplay}
        data-active={hasReel ? "true" : "false"}
        style={{ display: hasReel ? "block" : "none" }}
      />

      {/* film grain overlay (CSS-only, SVG feTurbulence data URL) */}
      <div className={styles.grain} />

      {/* 하단 vignette — 카피 가독성 확보 */}
      <div className={styles.vignette} />
    </div>
  );
}
