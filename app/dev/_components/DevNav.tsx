import Link from "next/link";
import styles from "./DevNav.module.css";

/**
 * Fixed top navigation matching the new 4-section layout.
 */

const LINKS = [
  { href: "#now", label: "now", num: "01" },
  { href: "#experience", label: "experience", num: "02" },
  { href: "#contact", label: "contact", num: "03" },
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
