import Link from "next/link";
import styles from "./SiteNav.module.css";

// Shared top nav for the 3 profile pages (actor / dev / designer).
// Each page passes its own brand label + section links. The accent color
// is governed by the `data-accent` attribute on the wrapping <html> /
// <div> — see app/globals.css for the resolution rules.
type NavLink = { href: string; label: string };

export function SiteNav({
  brand,
  brandHref = "/",
  links,
  homeLabel = "← milkfolio",
}: {
  brand: string;
  brandHref?: string;
  links: NavLink[];
  homeLabel?: string;
}) {
  return (
    <nav className={styles.nav} aria-label="Section navigation">
      <div className={styles.left}>
        <Link href="/" className={styles.home}>{homeLabel}</Link>
        <Link href={brandHref} className={styles.brand}>{brand}</Link>
      </div>
      <ul className={styles.links}>
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
