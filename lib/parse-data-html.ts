// ─────────────────────────────────────────────────────────────
// Parser: casting-agent `data.html` → typed AgentData.
// Producer-side contract (from hjee1/casting-agent/dashboard.py):
//   - h1 + .subtitle "마지막 업데이트: YYYY-MM-DD HH:MM UTC"
//   - .cards .card  (overview KPIs)
//   - <h2>중복 발송 감지</h2> + .alert        (optional)
//   - <h2>기간별 리포트</h2> + .tabs + #tbl-daily/weekly/monthly
//   - <h2>출처별 현황</h2> + .chart-bar rows
//   - <h2>API 비용 (추정)</h2> OR <h2>API 사용량 (실측)</h2> + .cost-grid
//   - <h2>지원 내역 (전체)</h2> + #tbl-apps
//
// This parser is intentionally tolerant — missing sections return empty arrays
// rather than throwing, so a partial Producer run still renders something.
// ─────────────────────────────────────────────────────────────

import * as cheerio from "cheerio";
import type {
  AgentData,
  Application,
  Channel,
  Cost,
  Kpi,
  PeriodTable,
  Periods,
  Anomaly,
} from "./types/agent";

export function parseDataHtml(html: string): AgentData {
  const $ = cheerio.load(html);

  return {
    lastUpdated: parseLastUpdated($),
    kpis: parseKpis($),
    applications: parseApplications($),
    periods: parsePeriods($),
    channels: parseChannels($),
    costs: parseCosts($),
    costsAreActual: parseCostsAreActual($),
    anomaly: parseAnomaly($),
  };
}

// ── individual parsers ──────────────────────────────────────────

function parseLastUpdated($: cheerio.CheerioAPI): string {
  const subtitle = $(".subtitle").first().text();
  const match = subtitle.match(/(\d{4}-\d{2}-\d{2}[^<]*?(?:KST|UTC)?)\s*$/);
  return (match ? match[1] : subtitle).trim();
}

function parseKpis($: cheerio.CheerioAPI): Kpi[] {
  return $(".cards .card")
    .map((_, el) => {
      const $el = $(el);
      const cls = ($el.attr("class") || "").split(/\s+/).filter((c) => c && c !== "card");
      return {
        num: $el.find(".num").text().trim(),
        label: $el.find(".label").text().trim(),
        tone: cls[0] ?? "neutral",
      };
    })
    .get();
}

function parseApplications($: cheerio.CheerioAPI): Application[] {
  return $("#tbl-apps tbody tr")
    .map((_, tr) => {
      const $tr = $(tr);
      const tds = $tr.find("td");
      // Layout drift: SPEC-EXTRACT-001 widened to 8 cols (date/src/title/director/company/role/email/status).
      // Legacy DB runs may still emit 6 cols (date/src/title/role/email/status). Detect by length.
      const isNew = tds.length >= 8;

      const titleCell = tds.eq(2);
      const titleAttr = titleCell.attr("title") || titleCell.text();
      const title = titleAttr.trim();

      // Linkified title (when SPEC-FILTER-001 dashboard-link visibility is on)
      const innerLink = titleCell.find("a").first();
      const url = (innerLink.attr("href") || $tr.attr("data-url") || "").trim();

      const badge = $tr.find(".badge").first();
      const badgeCls = (badge.attr("class") || "")
        .split(/\s+/)
        .filter((c) => c && c !== "badge");
      const status = badgeCls[0] ?? "";
      const statusLabel = badge.text().trim();

      return {
        date: tds.eq(0).text().trim(),
        source: tds.eq(1).text().trim(),
        title,
        director: isNew ? tds.eq(3).text().trim() : "",
        company: isNew ? tds.eq(4).text().trim() : "",
        role: (isNew ? tds.eq(5) : tds.eq(3)).text().trim(),
        email: (isNew ? tds.eq(6) : tds.eq(4)).text().trim(),
        status,
        statusLabel,
        url,
      } satisfies Application;
    })
    .get();
}

function parsePeriods($: cheerio.CheerioAPI): Periods {
  const out: Periods = {};
  (["daily", "weekly", "monthly"] as const).forEach((key) => {
    const $tbl = $(`#tbl-${key}`);
    if (!$tbl.length) return;
    const headers = $tbl
      .find("thead th")
      .map((_, th) => $(th).text().trim())
      .get();
    const rows = $tbl
      .find("tbody tr")
      .map((_, tr) =>
        $(tr)
          .find("td")
          .map((__, td) => $(td).text().trim())
          .get()
      )
      .get() as unknown as string[][];
    if (headers.length && rows.length) {
      out[key] = { headers, rows } satisfies PeriodTable;
    }
  });
  return out;
}

function parseChannels($: cheerio.CheerioAPI): Channel[] {
  return $(".chart-bar")
    .map((_, bar) => {
      const $bar = $(bar);
      const label = $bar.find(".bar-label").text().trim();
      const $fill = $bar.find(".bar-fill");
      const widthMatch = ($fill.attr("style") || "").match(/width:\s*([\d.]+)%/);
      const width = widthMatch ? parseFloat(widthMatch[1]) : 0;
      const count = parseInt($fill.text().trim().replace(/\D/g, ""), 10) || 0;
      // Producer emits "YES: N | 발송: N" in the last child div.
      const metaText = $bar.children().last().text();
      const yes = parseInt(metaText.match(/YES:\s*(\d+)/)?.[1] ?? "0", 10) || 0;
      const sent = parseInt(metaText.match(/발송:\s*(\d+)/)?.[1] ?? "0", 10) || 0;
      return { label, width, count, yes, sent } satisfies Channel;
    })
    .get();
}

function parseCosts($: cheerio.CheerioAPI): Cost[] {
  return $(".cost-item")
    .map((_, el) => ({
      label: $(el).find(".cost-label").text().trim(),
      value: $(el).find(".cost-val").text().trim(),
      detail: $(el).find(".cost-detail").text().trim(),
    }))
    .get() satisfies Cost[];
}

function parseCostsAreActual($: cheerio.CheerioAPI): boolean {
  // Heading toggles between "API 비용 (추정)" and "API 사용량 (실측)" per SPEC-USAGE-001.
  return $("h2")
    .toArray()
    .some((h) => /실측/.test($(h).text()));
}

function parseAnomaly($: cheerio.CheerioAPI): Anomaly | null {
  const $alert = $(".alert").first();
  if (!$alert.length) return null;
  const title = $alert.find("h3").text().trim();
  const bodyHtml = ($alert.find("p").first().html() ?? "").trim();
  if (!title && !bodyHtml) return null;
  return { title, bodyHtml };
}
