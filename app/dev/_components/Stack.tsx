import styles from "./Stack.module.css";

/**
 * Stack section — restructured around the AI Technical Engineer identity.
 *
 * Four shelves, not the old six. Primary tools highlighted with the cyan
 * marker. Categories are ordered by current frontline emphasis (Harness first,
 * Foundations last).
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-U-003
 */

type StackItem = { name: string; primary?: boolean };
type Category = {
  name: string;
  range: string;
  items: StackItem[];
};

const CATEGORIES: Category[] = [
  {
    name: "Harness & Orchestration",
    range: "2025 — now",
    items: [
      { name: "Claude Code", primary: true },
      { name: "MoAI", primary: true },
      { name: "Compound Engineering", primary: true },
      { name: "Cursor" },
      { name: "Codex CLI" },
    ],
  },
  {
    name: "AI Models & APIs",
    range: "production · research",
    items: [
      { name: "Anthropic Claude", primary: true },
      { name: "Mistral", primary: true },
      { name: "OpenAI" },
      { name: "Tool Use" },
      { name: "Structured Output" },
      { name: "Streaming" },
    ],
  },
  {
    name: "Engineering",
    range: "shipping",
    items: [
      { name: "TypeScript", primary: true },
      { name: "Next.js 16" },
      { name: "React 19" },
      { name: "Three.js / R3F" },
      { name: "Tailwind 4" },
      { name: "Playwright" },
      { name: "Vercel" },
    ],
  },
  {
    name: "Foundations",
    range: "carried forward",
    items: [
      { name: "Python", primary: true },
      { name: "SQL" },
      { name: "Bash" },
      { name: "Docker" },
      { name: "Git" },
      { name: "Linux" },
    ],
  },
];

export function Stack() {
  return (
    <section id="stack" className={styles.root}>
      <div className={styles.container}>
        <div className={styles.label}>
          <span className={styles.labelNum}>02 / 06</span>
          <span>Stack</span>
          <h2 className={styles.labelHead}>What I reach for.</h2>
          <p className={styles.labelHint}>
            Primary tools are marked. The rest is in active rotation, not just
            on the résumé.
          </p>
        </div>

        <div>
          <div className={styles.grid}>
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className={styles.category}>
                <div className={styles.categoryLabel}>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categoryRange}>{cat.range}</span>
                </div>
                <div className={styles.items}>
                  {cat.items.map((it) => (
                    <span
                      key={it.name}
                      className={`${styles.item} ${it.primary ? styles.primary : ""}`}
                    >
                      {it.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className={styles.footnote}>
            // <em>This list updates as I learn.</em> Tools come and go — the
            taste for picking the right one is what stays.
          </p>
        </div>
      </div>
    </section>
  );
}
