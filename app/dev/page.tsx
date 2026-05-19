import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "./_components/Hero";
import styles from "./page.module.css";

// Now a hybrid: Hero is a cinematic Client-driven section (R3F + live board),
// the remaining sections stay as static Server-rendered markup until they are
// migrated by subsequent turns of SPEC-DEV-REDESIGN-001.

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#stack", label: "Stack" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

const ABOUT_CARDS = [
  { num: "4", small: "+", label: "Years at Hanwha System" },
  { num: "3", label: "Native-level languages" },
  { num: "B.S.", label: "Computer Science, IIT" },
  { num: "∞", label: "Pipeline runs" },
] as const;

type StackCard = { icon: string; title: string; skills: { name: string; primary?: boolean }[] };
const STACK: StackCard[] = [
  {
    icon: "⚡",
    title: "Orchestration",
    skills: [{ name: "Apache Airflow", primary: true }, { name: "Cron" }, { name: "DAG Design" }],
  },
  {
    icon: "☁",
    title: "Data Platform",
    skills: [
      { name: "Databricks", primary: true },
      { name: "Snowflake", primary: true },
      { name: "Apache Spark" },
      { name: "Delta Lake" },
    ],
  },
  {
    icon: "🏭",
    title: "Industrial IoT",
    skills: [
      { name: "Cognite CDF", primary: true },
      { name: "OPC-UA" },
      { name: "Time Series" },
      { name: "Asset Modeling" },
    ],
  },
  {
    icon: "</>",
    title: "Languages",
    skills: [
      { name: "Python", primary: true },
      { name: "SQL", primary: true },
      { name: "Scala" },
      { name: "Bash" },
    ],
  },
  {
    icon: "🐳",
    title: "Infrastructure",
    skills: [{ name: "Docker" }, { name: "Kubernetes" }, { name: "Helm" }, { name: "Git" }],
  },
  { icon: "☁", title: "Cloud", skills: [{ name: "AWS" }, { name: "Azure" }] },
];

const CONTACTS = [
  {
    icon: "✉",
    label: "Email",
    value: "terryjhw@gmail.com",
    href: "mailto:terryjhw@gmail.com",
  },
  {
    icon: "↗",
    label: "LinkedIn",
    value: "hyunwoo-jee-79b981189",
    href: "https://linkedin.com/in/hyunwoo-jee-79b981189",
    external: true,
  },
];

export default function DevPage() {
  return (
    <div className={styles.body}>
      {/* NAV — kept inline to preserve the dev page's custom mono home link */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem 2.5rem",
          background: "rgba(7, 11, 18, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "#4a5568",
            letterSpacing: "0.05em",
          }}
        >
          ← milkfolio
        </Link>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: "2rem",
            margin: 0,
            padding: 0,
          }}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                style={{
                  fontSize: "0.82rem",
                  color: "#8899aa",
                  letterSpacing: "0.04em",
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO — SPEC-DEV-REDESIGN-001 Turn 2 (R3F particle field + live board) */}
      <Hero />

      {/* ABOUT ────────────────────────────────────── */}
      <section className={styles.section} id="about">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelNum}>01</span>
            <span className={styles.labelText}>About</span>
          </div>
          <div className={styles.aboutLayout}>
            <div className={styles.aboutText}>
              <h2 className={styles.aboutHeading}>
                I turn raw data into<br />
                <em>reliable systems.</em>
              </h2>
              <p>
                Data Engineer at <strong>Hanwha System</strong> with ~4 years building and
                maintaining production-grade data pipelines, orchestration workflows, and
                cloud data platforms across industrial and enterprise environments.
              </p>
              <p>
                B.S. in Computer Science from <strong>Illinois Institute of Technology</strong>,
                Chicago. Fluent in Korean, Chinese, and English — comfortable working across
                global teams with precision and clarity.
              </p>
              <p>
                Outside of data, I perform as an actor under the name{" "}
                <Link href="/actor" className={styles.inlineLink}>서해우</Link>.
              </p>
            </div>
            <div className={styles.aboutCards}>
              {ABOUT_CARDS.map((c) => (
                <div key={c.label} className={styles.infoCard}>
                  <span className={styles.infoNum}>
                    {c.num}
                    {"small" in c && c.small ? <small>{c.small}</small> : null}
                  </span>
                  <span className={styles.infoLabel}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STACK ────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="stack">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelNum}>02</span>
            <span className={styles.labelText}>Tech Stack</span>
          </div>
          <div className={styles.stackGrid}>
            {STACK.map((card) => (
              <div key={card.title} className={styles.stackCard}>
                <div className={styles.stackCardIcon}>{card.icon}</div>
                <h3 className={styles.stackCardTitle}>{card.title}</h3>
                <div className={styles.skillList}>
                  {card.skills.map((s) => (
                    <span
                      key={s.name}
                      className={`${styles.skill} ${s.primary ? styles.primary : ""}`}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE ────────────────────────────────── */}
      <section className={styles.section} id="experience">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelNum}>03</span>
            <span className={styles.labelText}>Experience</span>
          </div>
          <div className={styles.timeline}>
            <div className={styles.tlItem}>
              <div className={styles.tlLeft}>
                <span className={styles.tlPeriod}>2021 — Present</span>
              </div>
              <div className={styles.tlConnector}>
                <div className={`${styles.tlDot} ${styles.active}`} />
                <div className={styles.tlLine} />
              </div>
              <div>
                <p className={styles.tlCompany}>Hanwha System</p>
                <h3 className={styles.tlRole}>Data Engineer</h3>
                <ul className={styles.tlBullets}>
                  <li>Design and maintain production data pipelines using Apache Airflow</li>
                  <li>Data integration, transformation, and analytics on Databricks and Snowflake</li>
                  <li>Industrial IoT data ingestion and contextualization with Cognite CDF</li>
                  <li>Collaborate with cross-functional and international teams in Korean & English</li>
                </ul>
                <div className={styles.tlTags}>
                  {["Airflow", "Databricks", "Snowflake", "Cognite", "Python", "SQL"].map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.tlItem}>
              <div className={styles.tlLeft}>
                <span className={styles.tlPeriod}>Graduated</span>
              </div>
              <div className={styles.tlConnector}>
                <div className={styles.tlDot} />
              </div>
              <div>
                <p className={styles.tlCompany}>
                  Illinois Institute of Technology · Chicago
                </p>
                <h3 className={styles.tlRole}>B.S. Computer Science</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT ──────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionContact}`} id="contact">
        <div className={styles.container}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelNum}>04</span>
            <span className={styles.labelText}>Contact</span>
          </div>
          <div className={styles.contactLayout}>
            <div>
              <h2 className={styles.contactHeading}>
                Let&apos;s build<br /><em>something real.</em>
              </h2>
              <p className={styles.contactSub}>
                Open to data engineering roles, platform collaborations, and technical consulting.
              </p>
            </div>
            <div className={styles.contactLinks}>
              {CONTACTS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  {...(c.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={styles.clink}
                >
                  <span className={styles.clinkIcon}>{c.icon}</span>
                  <span className={styles.clinkText}>
                    <span className={styles.clinkLabel}>{c.label}</span>
                    <span className={styles.clinkVal}>{c.value}</span>
                  </span>
                  <span className={styles.clinkArrow}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter
        copyright="© 2025 Hyunwoo Jee. All rights reserved."
        extra="Built with Next.js"
      />
    </div>
  );
}
