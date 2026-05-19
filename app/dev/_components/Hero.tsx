import { HeroVisual } from "./HeroVisual";
import { HeroLiveBoard } from "./HeroLiveBoard";
import styles from "./Hero.module.css";

/**
 * /dev Hero — Server Component.
 *
 * Static text overlay renders during SSR (good LCP), client visual + live board
 * mount on hydration.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-001, REQ-DEV-U-003
 */
export function Hero() {
  return (
    <section id="top" className={styles.root}>
      <HeroVisual />
      <HeroLiveBoard />

      <div className={styles.overlay}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          AI Engineer
        </p>
        <h1 className={styles.name}>
          Hyunwoo <span className={styles.accent}>Jee.</span>
        </h1>
        <p className={styles.tag}>
          building the <em>harness</em> teams ship with.
        </p>
        <p className={styles.alias}>
          Terry <span className={styles.han}>· 지현우</span>
          <span className={styles.sep}>//</span>
          Seoul · remote-friendly
        </p>
      </div>

      <div className={styles.scrollHint}>
        <span>scroll</span>
      </div>
    </section>
  );
}
