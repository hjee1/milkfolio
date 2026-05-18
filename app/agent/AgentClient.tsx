"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchAgentData } from "./actions";
import type { AgentData, Application, Channel, Cost } from "@/lib/types/agent";
import styles from "./page.module.css";

// ─────────────────────────────────────────────────────────────
// Casting Agent — gate + dashboard (Phase 3 + 4)
// All UI text in Korean per user request; data identifiers in English.
//
// State machine:
//   1. Initial: gate visible, no data fetched.
//   2. sessionStorage.agent_auth === "true" OR correct password → fetch data.
//   3. Data loaded → render dashboard with 4 sections.
//   4. Refresh button → re-fetch via server action.
// ─────────────────────────────────────────────────────────────

const HASH =
  "069d0813302db114158752bdf1eb0e75f6dea6cd18a697013b66014066749032";
const PAGE_SIZE = 10;

type Tab = "period" | "apps" | "source" | "anomaly";
type StatusFilter = "all" | "sent" | "failed" | "skipped";
type PeriodFilter = "all" | "today" | "week" | "month";
type SortKey = "recent" | "oldest" | "title" | "source";
type PeriodKey = "daily" | "weekly" | "monthly";

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AgentClient() {
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await fetchAgentData();
    setLoading(false);
    if (result.ok) setData(result.data);
    else setData(null);
  }, []);

  // On mount: check session, auto-load if already authed.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("agent_auth") === "true") {
      setAuthed(true);
      void loadData();
    }
  }, [loadData]);

  const onAuth = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("agent_auth", "true");
    }
    setAuthed(true);
    void loadData();
  };

  const onLogout = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("agent_auth");
    }
    setAuthed(false);
    setData(null);
  };

  if (!authed) return <Gate onAuth={onAuth} />;
  return (
    <Dashboard
      data={data}
      loading={loading}
      onRefresh={loadData}
      onLogout={onLogout}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// GATE
// ─────────────────────────────────────────────────────────────
function Gate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    setError(false);
    const h = await sha256(pw);
    if (h === HASH) {
      onAuth();
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <div className={styles.gateView}>
      <div className={styles.gate}>
        <h1 className={styles.gateTitle}>캐스팅 에이전트</h1>
        <input
          ref={inputRef}
          type="password"
          className={styles.gateInput}
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={onKey}
          autoComplete="current-password"
          aria-label="비밀번호"
        />
        <div className={`${styles.gateError} ${error ? styles.show : ""}`}>
          잘못된 비밀번호입니다
        </div>
        <div className={styles.gateHint}>SHA-256 · 세션 한정</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD — sticky topnav + 4 sections + cost colophon
// ─────────────────────────────────────────────────────────────
function Dashboard({
  data,
  loading,
  onRefresh,
  onLogout,
}: {
  data: AgentData | null;
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("apps");

  // Refs for IntersectionObserver-based active-tab detection.
  const sectionRefs = {
    period: useRef<HTMLElement>(null),
    apps: useRef<HTMLElement>(null),
    source: useRef<HTMLElement>(null),
    anomaly: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (!best) return;
        const key = best.target.getAttribute("data-section") as Tab | null;
        if (key) setActiveTab(key);
      },
      { rootMargin: "-80px 0px -50% 0px", threshold: [0.1, 0.3, 0.5] },
    );
    Object.values(sectionRefs).forEach((r) => {
      if (r.current) obs.observe(r.current);
    });
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Headline stats — pulled from KPIs for top-right display.
  const totalCollected = data?.kpis.find((k) => /수집/.test(k.label))?.num ?? "—";
  const totalSent = data?.kpis.find((k) => /발송 성공|발송$/.test(k.label))?.num ?? "—";

  return (
    <div>
      <nav className={styles.topnav} aria-label="섹션 이동">
        <div className={styles.topnavInner}>
          <div className={styles.navBrand}>Casting Agent</div>
          <ul className={styles.navTabs}>
            <li>
              <button
                type="button"
                className={activeTab === "period" ? styles.active : ""}
                onClick={() => scrollTo("sec-period")}
              >기간별 리포트</button>
            </li>
            <li>
              <button
                type="button"
                className={activeTab === "apps" ? styles.active : ""}
                onClick={() => scrollTo("sec-apps")}
              >지원 내역</button>
            </li>
            <li>
              <button
                type="button"
                className={activeTab === "source" ? styles.active : ""}
                onClick={() => scrollTo("sec-source")}
              >출처별</button>
            </li>
            <li>
              <button
                type="button"
                className={activeTab === "anomaly" ? styles.active : ""}
                onClick={() => scrollTo("sec-anomaly")}
              >중복 감지</button>
            </li>
          </ul>
          <div className={styles.navStats}>
            <span>수집<em>{totalCollected}</em></span>
            <span>발송<em>{totalSent}</em></span>
            <span className={styles.navActions}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={onRefresh}
                title="새로고침"
                aria-label="새로고침"
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={onLogout}
                title="로그아웃"
                aria-label="로그아웃"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      </nav>

      {!data ? (
        <div className={styles.placeholder}>
          {loading ? "데이터 불러오는 중…" : "파이프라인 첫 실행을 기다리는 중입니다."}
        </div>
      ) : (
        <>
          <PeriodSection ref={sectionRefs.period} data={data} />
          <ApplicationsSection ref={sectionRefs.apps} data={data} />
          <ChannelsSection ref={sectionRefs.source} data={data} />
          <AnomalySection ref={sectionRefs.anomaly} data={data} />
          <CostColophon costs={data.costs} costsAreActual={data.costsAreActual} />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 1 — 기간별 리포트
// ─────────────────────────────────────────────────────────────
type SectionProps = { data: AgentData };

const PeriodSection = SectionWithRef(function PeriodSection({ data }: SectionProps) {
  const available = (["daily", "weekly", "monthly"] as const).filter(
    (k) => data.periods[k]?.rows.length,
  );
  const [tab, setTab] = useState<PeriodKey>(available[0] ?? "daily");
  const [page, setPage] = useState(0);
  const labels: Record<PeriodKey, string> = {
    daily: "일간 (30일)",
    weekly: "주간 (12주)",
    monthly: "월간",
  };

  // Reset page when switching tabs
  useEffect(() => { setPage(0); }, [tab]);

  const active = data.periods[tab];
  const totalPages = active ? Math.ceil(active.rows.length / PAGE_SIZE) : 0;
  const visible = active?.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];

  return (
    <section
      id="sec-period"
      data-section="period"
      className={styles.section}
    >
      <div className={styles.sectionHead}>
        <h2>기간별 리포트</h2>
        <span className={styles.secMeta}>일 · 주 · 월</span>
      </div>

      {available.length === 0 ? (
        <div className={styles.empty}>집계 데이터가 아직 없습니다.</div>
      ) : (
        <>
          <div className={styles.periodTabs}>
            {available.map((k) => (
              <button
                key={k}
                type="button"
                className={`${styles.periodTab} ${tab === k ? styles.active : ""}`}
                onClick={() => setTab(k)}
              >
                {labels[k]}
              </button>
            ))}
          </div>
          {active && (
            <>
              <table className={styles.periodTable}>
                <thead>
                  <tr>
                    {active.headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={numClass(active.headers[ci], cell)}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className={styles.pager}>
                  <button
                    type="button"
                    className={styles.pagerBtn}
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >이전</button>
                  <span className={styles.pagerInfo}>
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className={styles.pagerBtn}
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  >다음</button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
});

function numClass(header: string, value: string): string {
  const n = parseInt(value, 10);
  if (isNaN(n) || n === 0) return "";
  if (/YES|매치|적합/.test(header)) return styles.numGreen;
  if (/NO|부적합|실패/.test(header)) return styles.numRed;
  if (/MAYBE|보류/.test(header)) return styles.numAmber;
  if (/발송/.test(header)) return styles.numGreen;
  return "";
}

// ─────────────────────────────────────────────────────────────
// SECTION 2 — 지원 내역 (MAIN)
// ─────────────────────────────────────────────────────────────
const ApplicationsSection = SectionWithRef(function ApplicationsSection({
  data,
}: SectionProps) {
  const [query, setQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(0);

  // Reset page whenever filters change
  useEffect(() => { setPage(0); }, [query, periodFilter, statusFilter, sourceFilter, sort]);

  // Unique source list from data (for the source filter dropdown)
  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    data.applications.forEach((a) => a.source && set.add(a.source));
    return Array.from(set).sort();
  }, [data.applications]);

  const filtered = useMemo(
    () => filterAndSort(data.applications, { query, periodFilter, statusFilter, sourceFilter, sort }),
    [data.applications, query, periodFilter, statusFilter, sourceFilter, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const total = data.applications.length;

  const onReset = () => {
    setQuery("");
    setPeriodFilter("all");
    setStatusFilter("all");
    setSourceFilter("all");
    setSort("recent");
  };

  return (
    <section
      id="sec-apps"
      data-section="apps"
      className={`${styles.section} ${styles.main}`}
    >
      <div className={styles.sectionHead}>
        <h2>지원 내역</h2>
        <span className={styles.secMeta}>총 {total}건</span>
      </div>

      <div className={styles.subToolbar}>
        <div className={styles.toolbarRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="검색 (제목 · 감독 · 제작사 · 역할 · 수신 이메일)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="검색"
          />
          <select
            className={styles.filterSelect}
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            aria-label="기간 필터"
          >
            <option value="all">전체 기간</option>
            <option value="today">오늘</option>
            <option value="week">이번 주</option>
            <option value="month">이번 달</option>
          </select>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="상태 필터"
          >
            <option value="all">전체 상태</option>
            <option value="sent">발송 성공</option>
            <option value="failed">실패</option>
            <option value="skipped">건너뜀</option>
          </select>
          <select
            className={styles.filterSelect}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="출처 필터"
          >
            <option value="all">전체 출처</option>
            {sourceOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="정렬"
          >
            <option value="recent">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
            <option value="source">출처순</option>
          </select>
          <button
            type="button"
            className={styles.filterReset}
            onClick={onReset}
          >초기화</button>
        </div>
        <div className={styles.resultLine} aria-live="polite">
          {filtered.length === total
            ? <>총 <strong>{total}</strong>건</>
            : <>전체 {total}건 중 <strong>{filtered.length}</strong>건 일치</>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>조건과 일치하는 지원 내역이 없습니다.</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.appTable}>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>출처</th>
                  <th>제목</th>
                  <th>역할</th>
                  <th>수신</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a, i) => (
                  <ApplicationRow key={`${a.date}-${a.email}-${i}`} app={a} />
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className={styles.pager}>
              <button
                type="button"
                className={styles.pagerBtn}
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >이전</button>
              <span className={styles.pagerInfo}>{page + 1} / {totalPages} 페이지</span>
              <button
                type="button"
                className={styles.pagerBtn}
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >다음</button>
            </div>
          )}
        </>
      )}
    </section>
  );
});

function ApplicationRow({ app }: { app: Application }) {
  const srcCls =
    app.source === "actorCasting" || app.source === "volunteerActor" || app.source === "performerCasting"
      ? app.source
      : "default";
  const badgeCls = mapBadgeClass(app.status);
  return (
    <tr>
      <td className={styles.cellDate}>{app.date}</td>
      <td>
        <span className={`${styles.srcChip} ${styles[srcCls]}`}>{app.source}</span>
      </td>
      <td className={styles.cellTitle} title={app.title}>
        <span>{app.title}</span>
        {app.url && (
          <a
            className={styles.titleLink}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            title="원본 공고 열기"
            aria-label="원본 공고 열기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </td>
      <td className={styles.cellRole}>{app.role || "—"}</td>
      <td className={styles.cellEmail}>{app.email}</td>
      <td>
        <span className={`${styles.badge} ${styles[badgeCls]}`}>{app.statusLabel || badgeCls}</span>
      </td>
    </tr>
  );
}

function mapBadgeClass(status: string): string {
  if (!status) return "skipped";
  if (status === "sent") return "sent";
  if (status.startsWith("failed") || status === "sent_dbfail") return "failed";
  if (status.startsWith("skipped")) return "skipped";
  if (status === "dup") return "dup";
  return "skipped";
}

// ─────────────────────────────────────────────────────────────
// SECTION 3 — 출처별 현황
// ─────────────────────────────────────────────────────────────
const ChannelsSection = SectionWithRef(function ChannelsSection({ data }: SectionProps) {
  return (
    <section
      id="sec-source"
      data-section="source"
      className={styles.section}
    >
      <div className={styles.sectionHead}>
        <h2>출처별 현황</h2>
        <span className={styles.secMeta}>수집 · 매칭 · 발송</span>
      </div>
      {data.channels.length === 0 ? (
        <div className={styles.empty}>출처 데이터가 없습니다.</div>
      ) : (
        <div className={styles.channelList}>
          {data.channels.map((c) => (
            <ChannelRow key={c.label} channel={c} />
          ))}
        </div>
      )}
    </section>
  );
});

function ChannelRow({ channel }: { channel: Channel }) {
  return (
    <div className={styles.channelRow}>
      <div className={styles.channelLabel}>{channel.label}</div>
      <div className={styles.channelBar}>
        <div className={styles.channelFill} style={{ width: `${channel.width}%` }} />
      </div>
      <div className={styles.channelMeta}>
        <span className={styles.big}>{channel.count.toLocaleString("ko-KR")}</span>
        수집 · 매칭 {channel.yes} · 발송 {channel.sent}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 4 — 중복 감지 (bottom)
// ─────────────────────────────────────────────────────────────
const AnomalySection = SectionWithRef(function AnomalySection({ data }: SectionProps) {
  if (!data.anomaly) return null;
  return (
    <section
      id="sec-anomaly"
      data-section="anomaly"
      className={styles.section}
    >
      <div className={styles.sectionHead}>
        <h2>중복 발송 감지</h2>
        <span className={styles.secMeta}>이상 탐지</span>
      </div>
      <div className={styles.anomaly}>
        <div className={styles.anomalyMark} aria-hidden>!</div>
        <div>
          <div className={styles.anomalyTitle}>{data.anomaly.title}</div>
          <div
            className={styles.anomalyBody}
            // bodyHtml is sanitized by being parsed through cheerio's text()
            // for the title and html() for the body — Producer is trusted
            // (our own pipeline) and only emits <strong>. Still scope the
            // rendered HTML to text + strong by stripping anything else.
            dangerouslySetInnerHTML={{ __html: sanitizeBody(data.anomaly.bodyHtml) }}
          />
        </div>
      </div>
    </section>
  );
});

/** Strip everything except <strong> tags from the anomaly body. Defense-in-depth
 *  since the Producer is trusted but markup could drift in the future. */
function sanitizeBody(html: string): string {
  // Whitelist <strong>...</strong> by encoding everything else.
  // Step 1: replace opening/closing strong with sentinels
  const open = " STRONG_OPEN ";
  const close = " STRONG_CLOSE ";
  let s = html
    .replace(/<strong[^>]*>/gi, open)
    .replace(/<\/strong>/gi, close);
  // Step 2: strip everything else that looks like a tag
  s = s.replace(/<[^>]+>/g, "");
  // Step 3: HTML-escape the now-tagless content
  s = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // Step 4: restore the strong wrappers
  s = s.replaceAll(open, "<strong>").replaceAll(close, "</strong>");
  return s;
}

// ─────────────────────────────────────────────────────────────
// COST COLOPHON — single line at page bottom (Option B from earlier)
// ─────────────────────────────────────────────────────────────
function CostColophon({
  costs,
  costsAreActual,
}: {
  costs: Cost[];
  costsAreActual: boolean;
}) {
  const monthly = costs.find((c) => /월/.test(c.label));
  const total = costs.find((c) => /총\s*(누적|예상)/.test(c.label));
  if (!monthly && !total) return null;
  return (
    <footer className={styles.colophon}>
      <span className={styles.colophonLine}>
        {monthly && (
          <span className={styles.amt}>
            이번 달<strong>{monthly.value}</strong>
          </span>
        )}
        {monthly && total && <span className={styles.sep}>·</span>}
        {total && (
          <span className={styles.amt}>
            누적<strong>{total.value}</strong>
          </span>
        )}
        <span className={styles.sep}>·</span>
        <span className={`${styles.tag} ${costsAreActual ? styles.actual : ""}`}>
          {costsAreActual ? "실측" : "추정"}
        </span>
      </span>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// FILTER + SORT — pure helpers
// ─────────────────────────────────────────────────────────────
type FilterArgs = {
  query: string;
  periodFilter: PeriodFilter;
  statusFilter: StatusFilter;
  sourceFilter: string;
  sort: SortKey;
};

function filterAndSort(rows: Application[], args: FilterArgs): Application[] {
  const q = args.query.trim().toLowerCase();
  const now = new Date();
  const win = getPeriodWindow(now);

  const matched = rows.filter((a) => {
    if (q) {
      const hay = `${a.title} ${a.director} ${a.company} ${a.role} ${a.email} ${a.source}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (args.statusFilter !== "all" && !matchStatus(a.status, args.statusFilter)) return false;
    if (args.sourceFilter !== "all" && a.source !== args.sourceFilter) return false;
    if (args.periodFilter !== "all") {
      const d = parseDate(a.date);
      if (!d) return false;
      if (!inPeriod(d, args.periodFilter, win)) return false;
    }
    return true;
  });

  matched.sort((x, y) => {
    switch (args.sort) {
      case "oldest": return x.date.localeCompare(y.date);
      case "title":  return x.title.localeCompare(y.title, "ko");
      case "source": return x.source.localeCompare(y.source) || y.date.localeCompare(x.date);
      case "recent":
      default:       return y.date.localeCompare(x.date);
    }
  });
  return matched;
}

function matchStatus(raw: string, want: StatusFilter): boolean {
  if (want === "all") return true;
  if (!raw) return false;
  if (want === "sent") return raw === "sent";
  if (want === "failed") return raw.startsWith("failed") || raw === "sent_dbfail";
  if (want === "skipped") return raw.startsWith("skipped");
  return false;
}

type PeriodWindow = {
  todayStart: Date;
  tomorrow: Date;
  weekStart: Date;
  nextWeek: Date;
  monthStart: Date;
  nextMonth: Date;
};

function getPeriodWindow(now: Date): PeriodWindow {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(todayStart.getDate() + 1);
  // Week starts on Monday (Korean convention)
  const dow = todayStart.getDay();
  const monOffset = dow === 0 ? -6 : 1 - dow;
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() + monOffset);
  const nextWeek = new Date(weekStart);
  nextWeek.setDate(weekStart.getDate() + 7);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  const nextMonth = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 1);
  return { todayStart, tomorrow, weekStart, nextWeek, monthStart, nextMonth };
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const ms = Date.parse(s);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function inPeriod(d: Date, p: Exclude<PeriodFilter, "all">, win: PeriodWindow): boolean {
  const t = d.getTime();
  if (p === "today") return t >= win.todayStart.getTime() && t < win.tomorrow.getTime();
  if (p === "week")  return t >= win.weekStart.getTime() && t < win.nextWeek.getTime();
  if (p === "month") return t >= win.monthStart.getTime() && t < win.nextMonth.getTime();
  return true;
}

// ─────────────────────────────────────────────────────────────
// Helper: HOC that forwards a ref to a section component.
// React 19's automatic ref forwarding makes this trivial.
// ─────────────────────────────────────────────────────────────
function SectionWithRef<P extends SectionProps>(
  Component: (props: P & { ref?: React.Ref<HTMLElement> }) => React.ReactElement | null,
) {
  return Component as unknown as React.ForwardRefExoticComponent<
    P & React.RefAttributes<HTMLElement>
  >;
}
