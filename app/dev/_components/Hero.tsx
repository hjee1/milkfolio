import { HeroVisual } from "./HeroVisual";
import { HeroLiveBoard } from "./HeroLiveBoard";
import styles from "./Hero.module.css";

/**
 * /dev Hero — Server Component.
 *
 * Renders the static text overlay during SSR so LCP measures against real
 * content (not an empty canvas), then composes the client-only visual layer
 * and live board on hydration.
 *
 * @MX:ANCHOR: Owned by SPEC-DEV-REDESIGN-001. Layout structure is part of the
 *             contract — REQ-DEV-U-001 mandates Hero as section 1 of 6.
 * @MX:REASON: Replacing this without coordinating the rest of /dev breaks the
 *             page composition and the e2e suite that asserts the section list.
 */
export function Hero() {
  return (
    <section id="top" className={styles.root}>
      <HeroVisual />
      <HeroLiveBoard />

      <div className={styles.overlay}>
        <p className={styles.eyebrow}>AI Technical Engineer</p>
        <h1 className={styles.name}>
          Hyunwoo <span className={styles.accent}>Jee.</span>
        </h1>
        <p className={styles.alias}>
          Terry <span className={styles.han}>· 지현우</span>
        </p>
        <p className={styles.sub}>
          Working at the frontier where <em>AI engineering</em> meets human craft —
          standardizing harness workflows, composing agents, and building the next
          shape of how software gets made.
        </p>
      </div>

      <div className={styles.scrollHint}>scroll</div>
    </section>
  );
}
