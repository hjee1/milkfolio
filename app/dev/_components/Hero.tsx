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
        <p
          className={styles.eyebrow}
          data-robot-message="An AI Engineer! He builds harnesses for AI teams. SO cool!! 🤖"
        >
          <span className={styles.eyebrowDot} aria-hidden="true" />
          AI Engineer
        </p>
        <h1
          className={styles.name}
          data-robot-message="He is Terry! He loves playing games and can speak 4 languages!!! Isn't that amazing?"
        >
          Hyunwoo <span className={styles.accent}>Jee.</span>
        </h1>
        <p
          className={styles.tag}
          data-robot-message="A 'harness' is the toolkit that makes AI work for the whole team! He builds those!"
        >
          building the <em>harness</em> teams ship with.
        </p>
        <p
          className={styles.alias}
          data-robot-message="Terry is his English name! 지현우 is his Korean name! Same human, two names!"
        >
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
