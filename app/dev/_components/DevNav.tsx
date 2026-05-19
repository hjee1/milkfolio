import Link from "next/link";
import styles from "./DevNav.module.css";

/**
 * Fixed top navigation for /dev. Anchor links to each section, plus a quiet
 * back-link to the milkfolio landing.
 *
 * Sections match SPEC-DEV-REDESIGN-001 section order.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-001
 */

const LINKS = [
  { href: "#manifesto", label: "now", num: "01" },
  { href: "#lab", label: "lab", num: "03" },
  { href: "#stack", label: "stack", num: "02" },
  { href: "#craft", label: "craft", num: "04" },
  { href: "#contact", label: "contact", num: "05" },
];

export function DevNav() {
  return (
    <nav className={styles.nav} aria-label="Page sections">
      <Link href="/" className={styles.home}>
        ← milkfolio
      </Link>
      <ul className={styles.links}>
        {LINKS.map((l) => (
          <li key={l.href}>
            <a href={l.href} className={styles.link}>
              <span className={styles.linkNum}>{l.num}</span>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
