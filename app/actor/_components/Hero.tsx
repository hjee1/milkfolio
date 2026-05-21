import { HeroReel } from "./HeroReel";
import { HERO } from "../data";
import styles from "./Hero.module.css";

/**
 * /actor Hero — Editorial Magazine 풀-블리드 100vh Server Component.
 *
 * Server-rendered 카피 오버레이 + Client `<HeroReel>` 배경 비주얼.
 * 카피는 SSR로 즉시 표시되어 LCP가 안정적이다 (REQ-ACT-E-001).
 *
 * 카피 구조 (좌측 하단):
 *   - eyebrow: "ACTOR SINCE 2023" (Cormorant uppercase, gold 액센트 zone (b))
 *   - h1:      "S E O   H A E U" (Cormorant, 자간 0.3em, clamp 반응형)
 *   - subtitle: "서해우" (Pretendard light)
 *   - lineup hint: "Netflix · 당신이 죽였다 외" (REQ-ACT-E-001)
 * 우측 하단: scroll cue (작은 라인 + "Scroll")
 *
 * 페르소나 분리: 본문은 REQ-ACT-N-004 prohibited substring 목록과 무관해야
 * 한다. 카피에 IIT / Computer Science / Hyunwoo Jee / developer / engineer
 * 등이 포함되지 않는다. "Seo Haeu"는 허용되는 영문명이다.
 *
 * @MX:NOTE: [AUTO] Hero shell. Phase 2 이후에도 카피 구조 자체는 그대로
 *           유지되며 reelUrl 페이스트만으로 video가 활성된다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-003, REQ-ACT-U-004,
 *           REQ-ACT-E-001, REQ-ACT-E-006
 */
export function Hero() {
  return (
    <section className={styles.root} aria-label="Hero">
      <HeroReel posterImage={HERO.posterImage} reelUrl={HERO.reelUrl} />

      <div className={styles.overlay}>
        {/* eyebrow: gold zone (b) — REQ-ACT-U-011 section label small caps. */}
        <p className={styles.eyebrow}>Actor since 2023</p>

        <h1 className={styles.name} aria-label="Seo Haeu">
          <span aria-hidden="true">S E O&nbsp;&nbsp;H A E U</span>
        </h1>

        <p className={styles.subtitle}>서해우</p>

        <p className={styles.lineup}>{HERO.lineupHint}</p>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollLine} />
        <span className={styles.scrollLabel}>Scroll</span>
      </div>
    </section>
  );
}
