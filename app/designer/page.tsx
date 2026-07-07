import type { ReactElement } from "react";
import Link from "next/link";
import { ProjectGallery } from "./ProjectGallery";
import styles from "./page.module.css";

// Server Component — only the modal/carousel is a Client Component
// (ProjectGallery), the rest is pure markup with no JS shipped.

const NAV_LINKS = [
  { href: "#work", label: "Work" },
  { href: "#timeline", label: "Timeline" },
  { href: "#contact", label: "Contact" },
];

const HERO_META = [
  { label: "Focus", value: "PRODUCT & UX/UI DESIGN" },
  { label: "Languages", value: "KR · CN · EN" },
  { label: "Discipline", value: "DIGITAL × PHYSICAL" },
  { label: "Status", value: "OPEN TO WORK" },
];

// Timeline — language → education → recognition → experience.
// A growth arc: the strengths stack from who she is toward what she has done.
const TIMELINE = [
  {
    phase: "Language",
    headline: "Diverse cultural environments",
    lead: true,
    chips: [
      "Korean — Native",
      "Chinese — Native · Shenzhen, 10 yrs",
      "English — Native · US high school",
    ],
    desc: "Raised across Korea, China, and the United States. Design is how I translate between them — wordless persuasion that reads the same in any language.",
  },
  {
    phase: "Education",
    headline: "Korea University",
    lead: false,
    chips: ["Industrial Information Design", "Sep 2020 — Feb 2026", "GPA 4.09 / 4.50"],
    desc: "Trained where industrial design meets information and interaction — learning to move a single idea from sketch to physical form to interface.",
  },
  {
    phase: "Recognition",
    headline: "Awarded work",
    lead: false,
    chips: [
      "Daejeon Design Award — INSTIP",
      "KUPID Redesign — Grand Prize",
      "Easy Lab Makerthon — Excellence · PathGuard",
      "RoboWorld 2023 — PRISM",
    ],
    desc: "Recognized across inclusive design, service redesign, and public-safety work — from a wearable for deaf drivers to a university portal used by thousands.",
  },
  {
    phase: "Experience",
    headline: "KIST Robogram Lab",
    lead: false,
    chips: ["Industrial Design Intern", "AI & Robotics Research"],
    desc: "Led the exterior of the PRISM surgical robot side by side with engineers — from Rhino modeling to a working pre-production prototype shown at RoboWorld 2023.",
  },
];

const CONTACTS = [
  { label: "Name", value: "Yuna Jee" },
  { label: "Phone", value: "(+82) 010-8013-5727" },
  { label: "Email", value: "jeesally@gmail.com", href: "mailto:jeesally@gmail.com" },
  {
    label: "Instagram",
    value: "@yunajee_02",
    href: "https://instagram.com/yunajee_02",
    external: true,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/yuna-jee",
    href: "https://www.linkedin.com/in/yuna-jee-46579628b",
    external: true,
  },
];

// Original monochrome halftone — a dot matrix whose radii follow a per-variant
// field. Black dots on the white page (currentColor), inverted from ref image 4.
function Halftone({ variant }: { variant: number }) {
  const cols = 20;
  const rows = 12;
  const gap = 15;
  const maxR = 5.4;
  const dots: ReactElement[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = x / (cols - 1);
      const ny = y / (rows - 1);
      let t: number;
      switch (variant) {
        case 0: // radial bloom
          t = 1 - Math.min(1, Math.hypot(nx - 0.5, ny - 0.5) * 1.9);
          break;
        case 1: // diagonal fade
          t = 1 - (nx * 0.55 + ny * 0.45);
          break;
        case 2: // interference wave
          t = (Math.sin(nx * Math.PI * 3 + ny * 1.6) + 1) / 2;
          break;
        default: // sweep toward the edge
          t = 0.15 + nx * 0.85;
      }
      const r = Math.max(0.5, t * maxR);
      dots.push(
        <circle key={`${x}-${y}`} cx={x * gap + gap / 2} cy={y * gap + gap / 2} r={r} />,
      );
    }
  }
  return (
    <svg
      className={styles.halftone}
      viewBox={`0 0 ${cols * gap} ${rows * gap}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g fill="currentColor">{dots}</g>
    </svg>
  );
}

export default function DesignerPage() {
  return (
    <div className={styles.body}>
      {/* NAV ─────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.homeLink}>← milkfolio</Link>
          <div className={styles.nameBlock}>
            <span className={styles.logo}>Yuna Jee</span>
            <span className={styles.roleSub}>Product Designer</span>
          </div>
        </div>
        <ul className={styles.navTabs}>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO ────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>
            <span>Making a</span>
            <span>Point</span>
          </h1>
          <div className={styles.heroMeta}>
            {HERO_META.map((m) => (
              <div key={m.label} className={styles.metaCol}>
                <span className={styles.metaLabel}>{m.label}</span>
                <span className={styles.metaValue}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* WORK ────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.work}`} id="work">
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Selected Work</span>
          <h2 className={styles.workTitle}>Projects</h2>
          <ProjectGallery />
        </div>
      </section>

      {/* TIMELINE ─────────────────────────────────── */}
      <section className={`${styles.section} ${styles.timeline}`} id="timeline">
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Timeline</span>
          <h2 className={styles.workTitle}>The Arc</h2>
          <div className={styles.tlList}>
            {TIMELINE.map((t, i) => (
              <article
                key={t.phase}
                className={`${styles.tlItem} ${t.lead ? styles.tlLead : ""} ${
                  i % 2 === 1 ? styles.reverse : ""
                }`}
              >
                <div className={styles.tlText}>
                  <div className={styles.tlEyebrow}>
                    {String(i + 1).padStart(2, "0")} / {t.phase}
                  </div>
                  <h3 className={styles.tlHeadline}>{t.headline}</h3>
                  <div className={styles.tlChips}>
                    {t.chips.map((c) => (
                      <span key={c} className={styles.chip}>{c}</span>
                    ))}
                  </div>
                  <p className={styles.tlDesc}>{t.desc}</p>
                </div>
                <div className={styles.tlGraphic}>
                  <Halftone variant={i % 4} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT ─────────────────────────────────── */}
      <section className={`${styles.section} ${styles.contact}`} id="contact">
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            <div>
              <span className={styles.sectionLabel}>Get in Touch</span>
              <h2>Let&rsquo;s Connect</h2>
              <p className={styles.contactDesc}>
                Open to collaboration, freelance projects, and new opportunities.
              </p>
            </div>
            <ul className={styles.contactItems}>
              {CONTACTS.map((c) => (
                <li key={c.label}>
                  <span className={styles.ciLabel}>{c.label}</span>
                  {c.href ? (
                    <a
                      href={c.href}
                      className={`${styles.ciVal} ${styles.ciValLink}`}
                      {...(c.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className={styles.ciVal}>{c.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link href="/">← milkfolio</Link>
        <p className={styles.footerCopy}>© 2026 Yuna Jee. All rights reserved.</p>
      </footer>
    </div>
  );
}
