"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import replayData from "./lab/agent-replay.json";
import styles from "./WhatIDo.module.css";

type Step = {
  kind: "thought" | "toolCall" | "answer";
  text: string;
  kind2?: "success";
};

const STEPS = replayData as Step[];

const SPEED_BY_KIND: Record<Step["kind"], number> = {
  thought: 14,
  toolCall: 6,
  answer: 18,
};

const HOLD_AFTER_STEP = 200; // ms pause between steps

type Entry = { step: Step; partial: string; done: boolean; key: number };

/**
 * AgentTicker — full-height background-style coder feed.
 *
 * Reads from the same JSON used by the original Lab card but presents it as
 * a continuous, scrolling terminal stream. When it reaches the end, it
 * restarts. Visitors see "the page is coding" as long as they're looking.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-003, REQ-DEV-E-005, REQ-DEV-N-001
 */
export function AgentTicker() {
  const reduced = usePrefersReducedMotion();
  const [stepIdx, setStepIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef(0);

  // Static rendering for reduced motion: dump all steps once, no typing.
  useEffect(() => {
    if (!reduced) return;
    setEntries(
      STEPS.map((s, i) => ({ step: s, partial: s.text, done: true, key: i })),
    );
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    if (stepIdx >= STEPS.length) {
      // Restart after a beat — clear out the visible stream so it doesn't
      // grow unbounded, then resume from the top.
      tRef.current = setTimeout(() => {
        cycleRef.current += 1;
        setEntries([]);
        setStepIdx(0);
        setCharIdx(0);
      }, 1600);
      return () => {
        if (tRef.current) clearTimeout(tRef.current);
      };
    }

    const step = STEPS[stepIdx];
    const speed = SPEED_BY_KIND[step.kind];

    if (charIdx < step.text.length) {
      tRef.current = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else {
      tRef.current = setTimeout(() => {
        setStepIdx((i) => i + 1);
        setCharIdx(0);
      }, HOLD_AFTER_STEP);
    }

    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [stepIdx, charIdx, reduced]);

  // Mirror current partial into the visible entries array.
  useEffect(() => {
    if (reduced) return;
    if (stepIdx >= STEPS.length) return;
    const current = STEPS[stepIdx];
    const partial = current.text.slice(0, charIdx);
    setEntries((prev) => {
      const next = [...prev];
      const expectedLen = stepIdx + 1;
      const key = cycleRef.current * STEPS.length + stepIdx;
      const newEntry: Entry = {
        step: current,
        partial,
        done: charIdx >= current.text.length,
        key,
      };
      if (next.length < expectedLen) {
        next.push(newEntry);
      } else {
        next[stepIdx] = newEntry;
      }
      // Cap visible history so the DOM doesn't grow forever.
      return next.length > 14 ? next.slice(-14) : next;
    });
  }, [charIdx, stepIdx, reduced]);

  // Auto-scroll the stream to the latest line.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries]);

  return (
    <div className={styles.ticker} aria-label="Agent activity log">
      <div className={styles.tickerBar}>
        <span className={styles.tickerDot} />
        <span>agent · live</span>
        <span className={styles.tickerSpacer} />
        <span className={styles.tickerRoute}>~/harness</span>
      </div>
      <div className={styles.tickerStream} ref={scrollRef}>
        <div className={styles.tickerInner}>
          {entries.map((entry, i) => {
            const isLast = i === entries.length - 1;
            const prefix =
              entry.step.kind === "thought"
                ? "› "
                : entry.step.kind === "toolCall"
                  ? ""
                  : "✓ ";
            const cls = [
              styles.tickerBody,
              entry.step.kind === "thought" ? styles.thought : "",
              entry.step.kind === "toolCall" ? styles.toolCall : "",
              entry.step.kind === "answer" ? styles.answer : "",
              entry.step.kind2 === "success" && entry.done ? styles.success : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div
                key={entry.key}
                className={`${styles.tickerLine} ${entry.done ? "" : styles.fresh}`}
              >
                <span className={styles.tickerPrompt}>{prefix}</span>
                <span className={cls}>
                  {entry.partial}
                  {isLast && !entry.done && !reduced ? (
                    <span className={styles.tickerCursor} aria-hidden="true" />
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.tickerFoot}>
        <span>// transcript</span>
        <span>{reduced ? "static · reduced motion" : "streaming"}</span>
      </div>
    </div>
  );
}
