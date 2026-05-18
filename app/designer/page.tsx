import Link from "next/link";
import { ProjectGallery } from "./ProjectGallery";
import styles from "./page.module.css";

// Server Component — only the modal/carousel is a Client Component
// (ProjectGallery), the rest is pure markup with no JS shipped.

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

const SKILLS = [
  "UX/UI Design",
  "3D Modeling",
  "Brand Strategy",
  "Service Design",
  "Figma",
  "Rhino",
  "Midjourney",
];

const AWARDS = [
  { name: "Daejeon Design Award", project: "INSTIP" },
  { name: "Easy Lab Makerthon Excellence", project: "PathGuard" },
  { name: "RoboWorld 2023 Exhibition", project: "PRISM" },
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

export default function DesignerPage() {
  return (
    <div className={styles.body}>
      {/* NAV ─────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.homeLink}>← milkfolio</Link>
          <span className={styles.logo}>Yuna Jee</span>
        </div>
        <ul className={styles.navTabs}>
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ABOUT ───────────────────────────────────── */}
      <section className={`${styles.section} ${styles.first}`} id="about">
        <div className={styles.container}>
          <div className={styles.aboutLayout}>
            <div className={styles.aboutLeft}>
              <div className={styles.aboutTagline}>Design Portfolio 2026</div>
              <h1>
                Yuna <em>Jee.</em>
              </h1>
              <p className={styles.aboutBio}>
                A designer with a global perspective shaped by living across Korea, the United
                States, and China. I believe design is{" "}
                <strong>wordless persuasion</strong> — the art of bridging technology and human
                understanding.
              </p>
              <div className={styles.philosophy}>
                &ldquo;Same question, different perspectives — that&rsquo;s where design begins.&rdquo;
              </div>
              <p className={styles.aboutBio}>
                My work spans surgical robotics, prosumer sound platforms, inclusive wearables,
                and children&rsquo;s education brands. Each project starts with empathy, moves
                through rigorous iteration, and arrives at solutions that feel inevitable.
              </p>
              <div className={styles.skillsRow}>
                {SKILLS.map((s) => (
                  <span key={s} className={styles.skillPill}>{s}</span>
                ))}
              </div>
            </div>
            <div className={styles.aboutRight}>
              <div className={styles.infoSection}>
                <span className={styles.infoLabel}>Education</span>
                <div className={styles.infoValue}>Korea University</div>
                <div className={styles.infoSub}>Industrial Design</div>
              </div>
              <div className={styles.infoSection}>
                <span className={styles.infoLabel}>Experience</span>
                <div className={styles.infoValue}>KIST Robogram Lab</div>
                <div className={styles.infoSub}>
                  Industrial Design Intern — AI &amp; Robotics Research
                </div>
              </div>
              <div className={styles.infoSection}>
                <span className={styles.infoLabel}>Recognition</span>
                <ul className={styles.awardsCompact}>
                  {AWARDS.map((a) => (
                    <li key={a.project}>
                      <span className={styles.awName}>{a.name}</span>
                      <span className={styles.awProj}>{a.project}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.infoSection}>
                <span className={styles.infoLabel}>Interests</span>
                <p className={styles.interestsText}>
                  Synthesizer player in a band. Dance club organizer. Curious about the edges
                  where music, movement, and visual systems overlap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORK ────────────────────────────────────── */}
      <section className={`${styles.section} ${styles.work}`} id="work">
        <div className={styles.container}>
          <span className={styles.sectionLabel}>Selected Work</span>
          <h2 className={styles.workTitle}>Projects</h2>
          <ProjectGallery />
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
