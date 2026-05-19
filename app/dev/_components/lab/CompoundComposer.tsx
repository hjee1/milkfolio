"use client";

import { useMemo, useState } from "react";
import styles from "../Lab.module.css";

/**
 * Compound Composer — three orthogonal choices that compose into a fourth
 * cell-by-cell description. Demonstrates the "small primitives compose into
 * big results" idea behind compound engineering, without showing real code.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-003, REQ-DEV-S-003
 */

type SignalChoice = "events" | "queries" | "batches";
type DepthChoice = "thin" | "rich" | "graph";
type SpeedChoice = "live" | "near-time" | "scheduled";

const SIGNAL_OPTIONS: { value: SignalChoice; label: string }[] = [
  { value: "events", label: "events" },
  { value: "queries", label: "queries" },
  { value: "batches", label: "batches" },
];
const DEPTH_OPTIONS: { value: DepthChoice; label: string }[] = [
  { value: "thin", label: "thin" },
  { value: "rich", label: "rich" },
  { value: "graph", label: "graph" },
];
const SPEED_OPTIONS: { value: SpeedChoice; label: string }[] = [
  { value: "live", label: "live" },
  { value: "near-time", label: "near-time" },
  { value: "scheduled", label: "scheduled" },
];

function compose(
  signal: SignalChoice,
  depth: DepthChoice,
  speed: SpeedChoice,
): { archetype: string; latency: string; cost: string } {
  // Each combination resolves to an archetypal "shape" you'd actually build.
  // Hand-tuned so every triple reads as a real engineering decision.
  const map: Record<string, { archetype: string; latency: string; cost: string }> = {
    "events+thin+live": { archetype: "event log → topic stream", latency: "<100ms", cost: "$" },
    "events+thin+near-time": { archetype: "micro-batch sink", latency: "~5s", cost: "$" },
    "events+thin+scheduled": { archetype: "rolled-up hourly fact", latency: "1h", cost: "¢" },
    "events+rich+live": { archetype: "enriched event stream", latency: "<200ms", cost: "$$" },
    "events+rich+near-time": { archetype: "windowed aggregation", latency: "~30s", cost: "$" },
    "events+rich+scheduled": { archetype: "dimensional warehouse", latency: "daily", cost: "¢" },
    "events+graph+live": { archetype: "online graph store", latency: "<500ms", cost: "$$$" },
    "events+graph+near-time": { archetype: "graph projection job", latency: "~5min", cost: "$$" },
    "events+graph+scheduled": { archetype: "nightly graph rebuild", latency: "12h", cost: "$" },
    "queries+thin+live": { archetype: "edge cache lookup", latency: "<50ms", cost: "¢" },
    "queries+thin+near-time": { archetype: "materialized view", latency: "~10s lag", cost: "$" },
    "queries+thin+scheduled": { archetype: "static report", latency: "daily", cost: "¢" },
    "queries+rich+live": { archetype: "vector + relational fusion", latency: "<300ms", cost: "$$" },
    "queries+rich+near-time": { archetype: "BI semantic layer", latency: "~1min", cost: "$" },
    "queries+rich+scheduled": { archetype: "OLAP cube refresh", latency: "nightly", cost: "$" },
    "queries+graph+live": { archetype: "live knowledge graph", latency: "~1s", cost: "$$$" },
    "queries+graph+near-time": { archetype: "graph + RAG retrieval", latency: "~3s", cost: "$$" },
    "queries+graph+scheduled": { archetype: "weekly graph atlas", latency: "weekly", cost: "$" },
    "batches+thin+live": { archetype: "streaming ingest tail", latency: "<2s", cost: "$" },
    "batches+thin+near-time": { archetype: "5-minute micro-batch", latency: "5min", cost: "¢" },
    "batches+thin+scheduled": { archetype: "classic ETL job", latency: "nightly", cost: "¢" },
    "batches+rich+live": { archetype: "CDC + enrichment", latency: "<10s", cost: "$$" },
    "batches+rich+near-time": { archetype: "hourly star schema", latency: "1h", cost: "$" },
    "batches+rich+scheduled": { archetype: "warehouse-of-record", latency: "nightly", cost: "$" },
    "batches+graph+live": { archetype: "streaming graph CDC", latency: "<30s", cost: "$$$" },
    "batches+graph+near-time": { archetype: "incremental graph build", latency: "1h", cost: "$$" },
    "batches+graph+scheduled": { archetype: "monthly graph snapshot", latency: "monthly", cost: "¢" },
  };
  const key = `${signal}+${depth}+${speed}`;
  return map[key] ?? { archetype: "—", latency: "—", cost: "—" };
}

export function CompoundComposer() {
  const [signal, setSignal] = useState<SignalChoice>("events");
  const [depth, setDepth] = useState<DepthChoice>("rich");
  const [speed, setSpeed] = useState<SpeedChoice>("near-time");

  const result = useMemo(() => compose(signal, depth, speed), [signal, depth, speed]);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Compound</span>
        <span className={styles.cardIndex}>02 / 03</span>
      </div>
      <h3 className={styles.cardTitle}>Three knobs, twenty-seven systems.</h3>
      <p className={styles.cardDesc}>
        Pick a signal shape, a data depth, and a freshness budget. Every
        combination resolves to a system you&apos;d actually have to build.
      </p>
      <div className={styles.cardCanvas}>
        <div className={styles.composerControls}>
          <div className={styles.composerRow}>
            <span className={styles.composerLabel}>signal</span>
            <div className={styles.composerOptions} role="radiogroup" aria-label="Signal shape">
              {SIGNAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={signal === opt.value}
                  className={`${styles.composerOption} ${signal === opt.value ? styles.active : ""}`}
                  onClick={() => setSignal(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.composerRow}>
            <span className={styles.composerLabel}>depth</span>
            <div className={styles.composerOptions} role="radiogroup" aria-label="Data depth">
              {DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={depth === opt.value}
                  className={`${styles.composerOption} ${depth === opt.value ? styles.active : ""}`}
                  onClick={() => setDepth(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.composerRow}>
            <span className={styles.composerLabel}>freshness</span>
            <div className={styles.composerOptions} role="radiogroup" aria-label="Freshness budget">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={speed === opt.value}
                  className={`${styles.composerOption} ${speed === opt.value ? styles.active : ""}`}
                  onClick={() => setSpeed(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.composerOutput} aria-live="polite">
        <em>{result.archetype}</em>
        <br />
        latency: {result.latency} · cost: {result.cost}
      </div>
    </article>
  );
}
