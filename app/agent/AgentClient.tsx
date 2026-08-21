"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchAgentData } from "./actions";
import type { AgentData, Application, Channel, Kpi } from "@/lib/types/agent";
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
  "3324dab86f4dcdf48ba8ed6d736dcf050f09a23bf617c7d3579224548269ba1f";
const APPS_PAGE_SIZE = 9;                // 3×3 grid
const PERIOD_DAILY_PAGE_SIZE = 7;        // a week per page
const PERIOD_MONTHLY_PAGE_SIZE = 12;     // a year per page

type Tab = "apps" | "period" | "source" | "costs" | "anomaly";
type StatusFilter = "all" | "sent" | "failed" | "skipped";
type PeriodFilter = "all" | "today" | "week" | "month";
type SortKey = "recent" | "oldest" | "title" | "source";

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

  // IntersectionObserver-based active-tab detection. We observe sections by
  // their data-section attribute (set on each <section> element). No refs
  // needed — querySelectorAll runs after the sections render via the data
  // dependency below.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (!data) return;
    const targets = document.querySelectorAll<HTMLElement>("[data-section]");
    if (targets.length === 0) return;
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
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
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
                className={activeTab === "apps" ? styles.active : ""}
                onClick={() => scrollTo("sec-apps")}
              >지원 내역</button>
            </li>
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
                className={activeTab === "source" ? styles.active : ""}
                onClick={() => scrollTo("sec-source")}
              >출처별</button>
            </li>
            <li>
              <button
                type="button"
                className={activeTab === "costs" ? styles.active : ""}
                onClick={() => scrollTo("sec-costs")}
              >API 사용량</button>
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
          <KpiStrip kpis={data.kpis} />
          <ApplicationsSection data={data} />
          <PeriodSection data={data} />
          <ChannelsSection data={data} />
          <CostsSection data={data} />
          <AnomalySection data={data} />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KPI STRIP — parsed KPIs were previously dropped on the floor
// (only two numbers surfaced in the topnav). Render them all as a
// compact band above the main section.
// ─────────────────────────────────────────────────────────────
function kpiToneClass(tone: string): string {
  switch (tone) {
    case "green":  return styles.kpiGreen;
    case "red":    return styles.kpiRed;
    case "yellow": return styles.kpiAmber;
    case "orange": return styles.kpiOrange;
    case "blue":   return styles.kpiBlue;
    default:       return "";
  }
}

function KpiStrip({ kpis }: { kpis: Kpi[] }) {
  if (kpis.length === 0) return null;
  return (
    <section className={styles.kpiStrip} aria-label="핵심 지표">
      {kpis.map((k) => (
        <div key={k.label} className={`${styles.kpiCard} ${kpiToneClass(k.tone)}`}>
          <span className={styles.kpiNum}>{k.num}</span>
          <span className={styles.kpiLabel}>{k.label}</span>
        </div>
      ))}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION 1 — 기간별 리포트
// ─────────────────────────────────────────────────────────────
type SectionProps = { data: AgentData };

function PeriodSection({ data }: SectionProps) {
  // Per user feedback: daily + monthly tabs. Weekly removed (was redundant
  // with daily). Paginate daily at 7-rows-per-page (one week per page),
  // monthly at 12 rows (one year per page).
  type PKey = "daily" | "monthly";
  const available = (["daily", "monthly"] as const).filter(
    (k) => data.periods[k]?.rows.length,
  );
  const [tab, setTab] = useState<PKey>(available[0] ?? "daily");
  const [page, setPage] = useState(0);

  // Reset page index when switching tabs so we never land past the last page.
  useEffect(() => { setPage(0); }, [tab]);

  const active = data.periods[tab];
  const pageSize = tab === "daily" ? PERIOD_DAILY_PAGE_SIZE : PERIOD_MONTHLY_PAGE_SIZE;
  const totalPages = active ? Math.max(1, Math.ceil(active.rows.length / pageSize)) : 1;
  const visible = active?.rows.slice(page * pageSize, (page + 1) * pageSize) ?? [];

  const tabLabel: Record<PKey, string> = {
    daily: "일간",
    monthly: "월간",
  };

  return (
    <section
      id="sec-period"
      data-section="period"
      className={styles.section}
    >
      <div className={styles.sectionHead}>
        <h2>기간별 리포트</h2>
        <span className={styles.secMeta}>
          {tab === "daily" ? "7일씩 페이지" : "12개월씩 페이지"}
        </span>
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
                aria-pressed={tab === k}
              >
                {tabLabel[k]}
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
                    {page + 1} / {totalPages} 페이지
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
}

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
function ApplicationsSection({ data }: SectionProps) {
  const [query, setQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Application | null>(null);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / APPS_PAGE_SIZE));
  const visible = filtered.slice(page * APPS_PAGE_SIZE, (page + 1) * APPS_PAGE_SIZE);
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
            placeholder="검색 (제목 · 감독 · 제작사 · 역할 · 이메일 · 본문)"
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
          <div className={styles.cardGrid}>
            {visible.map((a, i) => (
              <ApplicationCard
                key={`${a.date}-${a.email}-${i}`}
                app={a}
                onSelect={() => setSelected(a)}
              />
            ))}
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

      {selected && (
        <ApplicationDetailModal app={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

function mapSourceClass(
  source: string,
): "actorCasting" | "volunteerActor" | "performerCasting" | "default" {
  return source === "actorCasting" || source === "volunteerActor" || source === "performerCasting"
    ? source
    : "default";
}

function ApplicationCard({ app, onSelect }: { app: Application; onSelect: () => void }) {
  const srcCls = mapSourceClass(app.source);
  const badgeCls = mapBadgeClass(app.status);
  const credits = [app.director && `DIR. ${app.director}`, app.company].filter(Boolean).join(" · ");

  // Card click opens the in-page detail modal (NOT the external posting —
  // listings are often deleted by their authors, so the DB snapshot is shown
  // first; the original-URL link lives at the bottom of the modal instead).
  return (
    <button
      type="button"
      className={`${styles.castCard} ${styles.clickable}`}
      onClick={onSelect}
      aria-label={`상세 보기: ${app.title}`}
    >
      <div className={styles.cardHead}>
        <span className={styles.cardDate}>{app.date}</span>
        <span className={`${styles.cardStatus} ${styles[badgeCls]}`}>
          {app.statusLabel || badgeCls}
        </span>
      </div>
      {credits && <div className={styles.cardCredits}>{credits}</div>}
      <h3 className={styles.cardTitle} title={app.title}>{app.title}</h3>
      <p className={styles.cardRole}>{app.role || "역할 미지정"}</p>
      <div className={styles.cardFoot}>
        <span className={`${styles.srcChip} ${styles[srcCls]}`}>{app.source}</span>
        <span className={styles.cardEmail} title={app.email}>{app.email}</span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// APPLICATION DETAIL MODAL
// Full DB snapshot of one listing. The external posting link is a
// separate button at the bottom with a "may be deleted" caveat.
// ─────────────────────────────────────────────────────────────
function ApplicationDetailModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const srcCls = mapSourceClass(app.source);
  const badgeCls = mapBadgeClass(app.status);

  const facts: Array<[string, string]> = (
    [
      ["감독", app.director],
      ["제작사", app.company],
      ["역할", app.role],
      ["성별", app.gender],
      ["연령대", app.ageRange],
      ["페이", app.pay],
      ["마감일", app.deadline],
      ["담당자", app.contactName],
      ["수신 이메일", app.email],
      ["발송 메일 제목", app.emailSubject],
    ] as Array<[string, string]>
  ).filter(([, v]) => v !== "");

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="presentation">
      <div
        className={styles.modalPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHead}>
          <span className={styles.cardDate}>{app.date}</span>
          <span className={`${styles.srcChip} ${styles[srcCls]}`}>{app.source}</span>
          <span className={`${styles.cardStatus} ${styles[badgeCls]}`}>
            {app.statusLabel || badgeCls}
          </span>
          <button
            ref={closeRef}
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h3 id="app-detail-title" className={styles.modalTitle}>{app.title}</h3>

        {facts.length > 0 && (
          <dl className={styles.modalFacts}>
            {facts.map(([k, v]) => (
              <div key={k} className={styles.modalFact}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {app.description ? (
          <div className={styles.modalDesc}>
            <h4>공고 본문</h4>
            <p>{app.description}</p>
          </div>
        ) : (
          <div className={styles.modalDescEmpty}>
            공고 본문이 아직 수집 데이터에 없습니다 — casting-agent 다음 리포트부터 포함됩니다.
          </div>
        )}

        {app.reasoning && (
          <div className={styles.modalReason}>
            <h4>AI 매칭 근거</h4>
            <p>{app.reasoning}</p>
          </div>
        )}

        <div className={styles.modalLinkBox}>
          {app.url ? (
            <>
              <a
                className={styles.modalLinkBtn}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                원본 공고 열기
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <span className={styles.modalLinkNote}>
                작성자가 공고를 삭제했을 수 있습니다 — 위 내용은 수집 시점의 DB 스냅샷입니다.
              </span>
            </>
          ) : (
            <span className={styles.modalLinkNote}>원본 공고 URL이 수집되지 않은 항목입니다.</span>
          )}
        </div>
      </div>
    </div>
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
function ChannelsSection({ data }: SectionProps) {
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
}

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
function AnomalySection({ data }: SectionProps) {
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
}

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
// SECTION 5 — API 사용량 (4 cards)
// Total/monthly cards get an accent rail on the left edge.
// ─────────────────────────────────────────────────────────────
function CostsSection({ data }: SectionProps) {
  const { costs, costsAreActual } = data;
  if (costs.length === 0) return null;

  // Heuristic: cards whose label mentions "총" or "월" are the totals.
  const isTotal = (label: string) => /총|월/.test(label);

  return (
    <section
      id="sec-costs"
      data-section="costs"
      className={styles.section}
    >
      <div className={styles.sectionHead}>
        <h2>
          API 사용량
          <span className={`${styles.costMode} ${costsAreActual ? styles.actual : ""}`}>
            {costsAreActual ? "실측" : "추정"}
          </span>
        </h2>
        <span className={styles.secMeta}>
          {costsAreActual ? "response.usage 기반" : "호출 횟수 추정"}
        </span>
      </div>
      <div className={styles.costsGrid}>
        {costs.map((c, i) => (
          <div
            key={`${c.label}-${i}`}
            className={`${styles.costItem} ${isTotal(c.label) ? styles.total : ""}`}
          >
            <div className={styles.costLabel}>{c.label}</div>
            <div className={styles.costVal}>{c.value}</div>
            <div className={styles.costDetail}>{c.detail}</div>
          </div>
        ))}
      </div>
    </section>
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
      const hay =
        `${a.title} ${a.director} ${a.company} ${a.role} ${a.email} ${a.source} ${a.description} ${a.reasoning}`.toLowerCase();
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
