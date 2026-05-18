import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "milkfolio",
  description: "서해우 (Actor) · Terry Jee (Data Engineer) · Designer — three identities, one domain.",
  openGraph: {
    title: "milkfolio",
    description: "A personal portfolio space — Actor, Data Engineer, Designer.",
    url: "https://milkfolio.space/",
  },
};

// Server Component — no client JS, the hover behaviour is pure CSS (:has selector).
// All three panels share the same shape, only the accent color differs.
type Panel = {
  num: string;
  role: string;
  name: string;
  desc: string;
  cta: string;
  href: string;
  accent: "actor" | "dev" | "designer";
};

const PANELS: Panel[] = [
  {
    num: "01",
    role: "Actor",
    name: "서해우",
    desc: "Korean drama · short film · musical. Available for casting.",
    cta: "View Profile →",
    href: "/actor",
    accent: "actor",
  },
  {
    num: "02",
    role: "Data Engineer",
    name: "Hyunwoo Jee",
    desc: "Pipelines at scale. Airflow · Databricks · Snowflake · Cognite.",
    cta: "View Profile →",
    href: "/dev",
    accent: "dev",
  },
  {
    num: "03",
    role: "Designer",
    name: "Yuna Jee",
    desc: "UX/UI · Product Design · 3D Modeling · Brand Strategy.",
    cta: "View Portfolio →",
    href: "/designer",
    accent: "designer",
  },
];

export default function HomePage() {
  return (
    <div className={styles.root}>
      <span className={styles.logo}>Milkfolio</span>
      <main className={styles.panels}>
        {PANELS.map((p) => (
          <Link
            key={p.num}
            href={p.href}
            className={`${styles.panel} ${styles[p.accent]}`}
            aria-label={`${p.role} — ${p.name}`}
          >
            <div className={styles.glow} aria-hidden />
            <div className={styles.content}>
              <span className={styles.num}>{p.num}</span>
              <p className={styles.role}>{p.role}</p>
              <h2 className={styles.name}>{p.name}</h2>
              <p className={styles.desc}>{p.desc}</p>
              <span className={styles.cta}>{p.cta}</span>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
