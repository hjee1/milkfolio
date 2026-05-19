"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";
import replayData from "./agent-replay.json";
import styles from "../Lab.module.css";

type Step = {
  kind: "thought" | "toolCall" | "answer";
  text: string;
  kind2?: "success";
};

const STEPS = replayData as Step[];

// Per-character typing speed (ms). Tool calls type slightly faster — they're
// dense and visually "looking up things", so a faster pace reads naturally.
const SPEED_BY_KIND: Record<Step["kind"], number> = {
  thought: 18,
  toolCall: 8,
  answer: 22,
};

/**
 * Agent Thinking Replay — pre-recorded agent transcript that re-plays as if it
 * were happening right now. Token-by-token typewriter, color-coded by step
 * type (thought / tool call / final answer).
 *
 * Zero network calls. The "agent" is JSON.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-003, REQ-DEV-N-001
 */
export function AgentReplay() {
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [stepIdx, setStepIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [renderedSteps, setRenderedSteps] = useState<
    Array<{ step: Step; partial: string; done: boolean }>
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced) {
      // Reduced motion: render all steps fully, no typing, no auto-loop.
      setRenderedSteps(STEPS.map((s) => ({ step: s, partial: s.text, done: true })));
      setStepIdx(STEPS.length);
      return;
    }
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    if (!playing) return;

    if (stepIdx >= STEPS.length) {
      // Loop after a beat.
      timeoutRef.current = setTimeout(() => {
        setStepIdx(0);
        setCharIdx(0);
        setRenderedSteps([]);
      }, 3500);
      return;
    }

    const step = STEPS[stepIdx];
    const speed = SPEED_BY_KIND[step.kind];

    if (charIdx < step.text.length) {
      timeoutRef.current = setTimeout(() => {
        setCharIdx((c) => c + 1);
      }, speed);
    } else {
      // Finalize this step and move on.
      timeoutRef.current = setTimeout(() => {
        setRenderedSteps((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (lastIdx >= 0) next[lastIdx] = { ...next[lastIdx], done: true };
          return next;
        });
        setStepIdx((i) => i + 1);
        setCharIdx(0);
      }, 250);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [stepIdx, charIdx, playing, reduced]);

  // Mirror the current typed-out partial back into renderedSteps.
  useEffect(() => {
    if (reduced) return;
    if (stepIdx >= STEPS.length) return;
    const current = STEPS[stepIdx];
    const partial = current.text.slice(0, charIdx);
    setRenderedSteps((prev) => {
      const next = [...prev];
      if (next.length === stepIdx) {
        next.push({ step: current, partial, done: false });
      } else if (next.length > stepIdx) {
        next[stepIdx] = { step: current, partial, done: charIdx >= current.text.length };
      }
      return next;
    });
  }, [charIdx, stepIdx, reduced]);

  // Auto-scroll the stream as it grows.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [renderedSteps]);

  const isStreaming = !reduced && playing && stepIdx < STEPS.length;
  const isLooping = !reduced && playing && stepIdx >= STEPS.length;
  const status = reduced
    ? "static · reduced motion"
    : isLooping
      ? "restarting…"
      : isStreaming
        ? "streaming"
        : "paused";

  const handleToggle = () => setPlaying((p) => !p);

  const handleRestart = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStepIdx(0);
    setCharIdx(0);
    setRenderedSteps([]);
    setPlaying(true);
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>Agent Replay</span>
        <span className={styles.cardIndex}>01 / 03</span>
      </div>
      <h3 className={styles.cardTitle}>How an agent thinks.</h3>
      <p className={styles.cardDesc}>
        A pre-recorded transcript of an agent shaving 8 hours off a data
        pipeline. Thought, tool call, answer — colored as they would be in a
        real harness console.
      </p>
      <div className={styles.cardCanvas}>
        <div className={styles.replayStream} ref={scrollRef}>
          {renderedSteps.map((entry, i) => {
            const isLast = i === renderedSteps.length - 1;
            const prefix =
              entry.step.kind === "thought"
                ? "› "
                : entry.step.kind === "toolCall"
                  ? "" // tool calls already include the arrow in data
                  : "✓ ";
            const bodyClass = [
              styles.replayBody,
              entry.step.kind === "toolCall" ? styles.toolCall : "",
              entry.step.kind === "thought" ? styles.thought : "",
              entry.step.kind === "answer" ? styles.answer : "",
              entry.step.kind2 === "success" && entry.done ? styles.success : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div key={i} className={styles.replayLine}>
                <span className={styles.replayPrompt}>{prefix}</span>
                <span className={bodyClass}>
                  {entry.partial}
                  {isLast && !entry.done && !reduced ? (
                    <span className={styles.cursor} aria-hidden="true" />
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.cardControls}>
        <button
          className={styles.btn}
          onClick={handleToggle}
          disabled={reduced}
          aria-label={playing ? "Pause replay" : "Play replay"}
        >
          {playing ? "pause" : "play"}
        </button>
        <button
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={handleRestart}
          aria-label="Restart replay"
        >
          restart
        </button>
        <span className={styles.statusLine}>{status}</span>
      </div>
    </article>
  );
}
