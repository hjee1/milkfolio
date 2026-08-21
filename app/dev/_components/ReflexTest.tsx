"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import styles from "./ReflexTest.module.css";

/**
 * ReflexTest — 5-round clickable reaction-time challenge.
 *
 * Flow per round:
 *   1) "tap to start"   (idle)
 *   2) "wait for it..." (waiting; random 800–2400ms)
 *   3) "CLICK!"         (go — start timestamp captured)
 *   4) click            (measure ms)
 *   5) repeat for 5 rounds, then show average + best
 *
 * Click during waiting → "too soon" fault. The round doesn't count.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 — Turn 6 (interactive demo, replaces GoL)
 * @MX:NOTE: Best score persists per session via localStorage. Cleared by /clear.
 */

type Phase = "idle" | "waiting" | "go" | "tooSoon" | "done";

const TOTAL_ROUNDS = 5;
const WAIT_MIN_MS = 800;
const WAIT_MAX_MS = 2400;
const STORAGE_KEY = "milkfolio.dev.reflex.best";

type RoundResult = { ms: number | null }; // null = fault

export function ReflexTest() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);

  const goAtRef = useRef<number>(0);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate best from localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const n = Number.parseInt(stored, 10);
      if (Number.isFinite(n) && n > 0) setBest(n);
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
  }, []);

  // ── Start a single round ────────────────────────────
  // The wait length is intentionally hidden — no progress bar — so the player
  // can't read the cue. Surprise is the whole point of the game.
  const beginRound = useCallback(() => {
    setLastMs(null);
    setPhase("waiting");
    const wait = WAIT_MIN_MS + Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS);
    waitTimerRef.current = setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase("go");
    }, wait);
  }, []);

  const handleSurfaceActivate = useCallback(() => {
    if (reduced) return;

    if (phase === "idle") {
      setRound(0);
      setResults([]);
      setLastMs(null);
      beginRound();
      return;
    }

    if (phase === "waiting") {
      // Clicked too soon.
      clearTimers();
      const next = [...results, { ms: null } as RoundResult];
      setResults(next);
      setPhase("tooSoon");
      // Show "too soon" briefly, then advance.
      waitTimerRef.current = setTimeout(() => {
        if (round + 1 >= TOTAL_ROUNDS) {
          setPhase("done");
          setRound(round + 1);
        } else {
          setRound(round + 1);
          beginRound();
        }
      }, 900);
      return;
    }

    if (phase === "go") {
      const reaction = Math.round(performance.now() - goAtRef.current);
      setLastMs(reaction);
      const next = [...results, { ms: reaction } as RoundResult];
      setResults(next);

      // Update best.
      setBest((prev) => {
        const newBest = prev == null ? reaction : Math.min(prev, reaction);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, String(newBest));
        }
        return newBest;
      });

      if (round + 1 >= TOTAL_ROUNDS) {
        setPhase("done");
        setRound(round + 1);
      } else {
        setRound(round + 1);
        waitTimerRef.current = setTimeout(() => beginRound(), 450);
      }
      return;
    }

    if (phase === "tooSoon" || phase === "done") {
      // Treat clicks during fault/results as "start a new session".
      setRound(0);
      setResults([]);
      setLastMs(null);
      beginRound();
      return;
    }
  }, [phase, round, results, beginRound, clearTimers, reduced]);

  // Keyboard activation — space/enter behave like click.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleSurfaceActivate();
    }
  };

  const handleReset = () => {
    clearTimers();
    setPhase("idle");
    setRound(0);
    setResults([]);
    setLastMs(null);
  };

  const handleClearBest = () => {
    setBest(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Cleanup on unmount.
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // ── Derived display values ──────────────────────────
  const valid = results.filter((r): r is { ms: number } => r.ms != null);
  const avg = valid.length > 0
    ? Math.round(valid.reduce((a, b) => a + b.ms, 0) / valid.length)
    : null;
  const fastest = valid.length > 0 ? Math.min(...valid.map((r) => r.ms)) : null;

  const isFirstTime =
    phase === "idle" && lastMs == null && results.length === 0;

  let heading = "tap to start";
  let subline = "click as soon as the screen turns cyan";
  let bigNumber: string | null = null;

  if (phase === "waiting") {
    heading = "wait for it…";
    subline = "don't jump the gun";
  } else if (phase === "go") {
    heading = "click!";
    subline = "now";
  } else if (phase === "tooSoon") {
    heading = "too soon";
    subline = "round skipped";
  } else if (phase === "done") {
    heading = avg != null ? `${avg}` : "no valid rounds";
    subline = avg != null
      ? `avg · best ${fastest} ms`
      : "click anywhere to retry";
    bigNumber = avg != null ? "ms" : null;
  } else if (lastMs != null && phase === "idle") {
    heading = `${lastMs}`;
    subline = "last round · tap to play again";
    bigNumber = "ms";
  }

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <span className={styles.barDot} />
        <span className={styles.barTitle}>reflex test</span>
        <span className={styles.barSpacer} />
        <span className={styles.barMeta}>
          round <strong>{Math.min(round + (phase === "idle" ? 0 : 1), TOTAL_ROUNDS)}</strong> / {TOTAL_ROUNDS}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        className={`${styles.surface} ${styles[phase]}`}
        onClick={handleSurfaceActivate}
        onKeyDown={onKeyDown}
        aria-label={`Reaction test — current phase ${phase}. Press space or click.`}
      >
        {phase === "done" && avg != null ? (
          <>
            <p className={styles.subline}>average</p>
            <h3 className={styles.bigNumber}>
              {avg}
              <span className={styles.unit}>ms</span>
            </h3>
            <p className={styles.subline}>{subline}</p>
          </>
        ) : lastMs != null && phase === "idle" ? (
          <>
            <p className={styles.subline}>last</p>
            <h3 className={styles.bigNumber}>
              {lastMs}
              <span className={styles.unit}>ms</span>
            </h3>
            <p className={styles.subline}>{subline}</p>
          </>
        ) : isFirstTime ? (
          <>
            <h3 className={styles.heading}>{heading}</h3>
            <p className={styles.subline}>{subline}</p>
            <div className={styles.guide}>
              <span className={styles.guideLabel}>// how to play</span>
              <div className={styles.guideStep}>
                <span className={styles.guideStepNum}>01</span>
                <span className={styles.guideStepText}>
                  press <em>start</em> to begin
                </span>
              </div>
              <div className={styles.guideStep}>
                <span className={styles.guideStepNum}>02</span>
                <span className={styles.guideStepText}>
                  wait while the screen is dim
                </span>
              </div>
              <div className={styles.guideStep}>
                <span className={styles.guideStepNum}>03</span>
                <span className={styles.guideStepText}>
                  click the instant it flashes <em>cyan</em>
                </span>
              </div>
              <div className={styles.guideStep}>
                <span className={styles.guideStepNum}>04</span>
                <span className={styles.guideStepText}>
                  5 rounds, then your <em>average + best</em>
                </span>
              </div>
              <p className={styles.guideWarn}>
                ⚠ clicking before the flash counts as a fault
              </p>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.heading}>{heading}</h3>
            <p className={styles.subline}>{subline}</p>
          </>
        )}
      </div>

      <div className={styles.rounds}>
        <span className={styles.roundsLabel}>rounds</span>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
          const r = results[i];
          if (!r) {
            return (
              <span key={i} className={styles.roundDot}>
                <span className={styles.roundNum}>0{i + 1}</span>
                <span>—</span>
              </span>
            );
          }
          if (r.ms == null) {
            return (
              <span key={i} className={`${styles.roundDot} ${styles.fault}`}>
                <span className={styles.roundNum}>0{i + 1}</span>
                <span>fault</span>
              </span>
            );
          }
          return (
            <span key={i} className={styles.roundDot}>
              <span className={styles.roundNum}>0{i + 1}</span>
              <span>{r.ms}ms</span>
            </span>
          );
        })}
        <span className={styles.spacer} />
        {best != null && (
          <span className={`${styles.best} ${styles.live}`}>
            <span className={styles.bestLabel}>best</span>
            <strong>{best}ms</strong>
          </span>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.btn} ${phase === "idle" ? styles.primary : styles.ghost}`}
          onClick={handleSurfaceActivate}
          disabled={reduced}
        >
          {phase === "idle"
            ? "start"
            : phase === "done"
              ? "play again"
              : phase === "go"
                ? "click now"
                : phase === "tooSoon"
                  ? "wait…"
                  : "ready"}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.ghost}`}
          onClick={handleReset}
        >
          reset
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.ghost}`}
          onClick={handleClearBest}
          disabled={best == null}
        >
          clear best
        </button>
        <span className={styles.legend}>// human reaction floor ≈ 150ms</span>
      </div>
    </div>
  );
}
