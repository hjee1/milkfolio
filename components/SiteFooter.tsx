import Link from "next/link";
import styles from "./SiteFooter.module.css";

// Shared footer for the 3 profile pages. Accent color comes from
// data-accent attribute on the wrapping element (same mechanism as SiteNav).
export function SiteFooter({
  copyright,
  extra,
}: {
  copyright: string;
  extra?: string;
}) {
  return (
    <footer className={styles.footer}>
      <Link href="/" className={styles.home}>← milkfolio</Link>
      <p>{copyright}</p>
      {extra ? <p className={styles.extra}>{extra}</p> : null}
    </footer>
  );
}
