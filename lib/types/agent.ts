// ─────────────────────────────────────────────────────────────
// Types for the casting-agent dashboard data flow.
// Producer: hjee1/casting-agent (Python `dashboard.py`)
// Consumer: this Next.js app, via `lib/parse-data-html.ts`.
// The Producer's HTML is owned externally — keep these types in sync
// with the section headings it emits (기간별/지원 내역/출처별/중복/API).
// ─────────────────────────────────────────────────────────────

/** Single dispatched application row (1 row in #tbl-apps). */
export type Application = {
  date: string;          // YYYY-MM-DD (KST)
  source: string;        // actorCasting | volunteerActor | performerCasting
  title: string;         // listing title (may include angle brackets)
  director: string;      // empty until SPEC-EXTRACT-001 fully rolled out
  company: string;       // empty until SPEC-EXTRACT-001 fully rolled out
  role: string;          // GPT-extracted role description
  email: string;         // recipient address
  /** Raw status class from data.html: "sent" | "failed_smtp" | "skipped_nokeyword" | "sent_dbfail" … */
  status: string;
  /** Human-readable status text shown inside the badge (Korean labels emitted by Producer). */
  statusLabel: string;
  /** Original posting URL if the Producer included a clickable title (empty otherwise). */
  url: string;
  // ── Detail fields — read from data-* attributes on each <tr>.  ──
  // Empty strings until the Producer emits them (rows generated before the
  // detail-attrs rollout simply lack the attributes; parser tolerates both).
  /** Listing body text, truncated by Producer (~1500 chars). */
  description: string;
  gender: string;
  ageRange: string;
  pay: string;
  deadline: string;
  contactName: string;
  /** AI filter's match reasoning (why this listing was a YES). */
  reasoning: string;
  /** Subject line of the application email that was sent. */
  emailSubject: string;
};

/** Headline KPI ("총 수집 공고", "발송 성공", …). */
export type Kpi = {
  num: string;
  label: string;
  /** Class name on .card from data.html — "blue" / "green" / "red" / "yellow" / "orange". */
  tone: string;
};

/** One of the three period reports (일간 30 / 주간 12 / 월간). */
export type PeriodTable = {
  headers: string[];
  rows: string[][];
};

export type Periods = {
  daily?: PeriodTable;
  weekly?: PeriodTable;
  monthly?: PeriodTable;
};

/** Source channel breakdown (.chart-bar row). */
export type Channel = {
  label: string;
  count: number;
  yes: number;
  sent: number;
  /** Percentage width emitted by Producer (already scaled relative to max). */
  width: number;
};

/** API cost grid item — actual or estimate, decided by section heading text. */
export type Cost = {
  label: string;
  value: string;
  detail: string;
};

/** Duplicate-send alert (.alert) — only present when Producer detected duplicates. */
export type Anomaly = {
  title: string;
  /** Producer emits HTML with `<strong>` highlights — render via dangerouslySetInnerHTML
   *  after sanitizing in the renderer. */
  bodyHtml: string;
};

/** Top-level parsed payload — what the Server Action returns. */
export type AgentData = {
  lastUpdated: string;        // empty string if Producer didn't tag it
  kpis: Kpi[];
  applications: Application[];
  periods: Periods;
  channels: Channel[];
  costs: Cost[];
  /** True when the API cost section heading says "실측" (post-SPEC-USAGE-001). */
  costsAreActual: boolean;
  anomaly: Anomaly | null;
};

export type FetchResult =
  | { ok: true; data: AgentData }
  | { ok: false; reason: "no-file" | "parse-error"; message?: string };
