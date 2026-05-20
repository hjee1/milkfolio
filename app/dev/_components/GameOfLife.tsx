"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import styles from "./GameOfLife.module.css";

/**
 * Conway's Game of Life — visitor-controlled cellular automaton.
 *
 * Paint cells by clicking or dragging. Hit play and watch the rules of the
 * Game of Life evolve the pattern. Stand-in for a "small game" with the
 * AI / cellular-systems aesthetic: emergent behavior from three simple rules.
 *
 * Rules (B3/S23):
 *   - A dead cell with exactly 3 live neighbors becomes alive.
 *   - A live cell with 2 or 3 live neighbors stays alive.
 *   - Everything else dies (or stays dead).
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 — REQ-DEV-E-003 (interactive demo)
 * @MX:NOTE: Canvas2D draw loop. ~10–20Hz simulation, throttled via `step` interval.
 *           Painting is debounced through `lastCellRef` so a drag doesn't toggle the
 *           same cell back and forth as the mouse re-enters it.
 */

const COLS = 44;
const ROWS = 22;
const ALIVE_COLOR = "#38d9ff";
const ALIVE_GLOW = "rgba(56, 217, 255, 0.35)";
const GRID_COLOR = "rgba(56, 217, 255, 0.06)";
const BG_COLOR = "#02050b";

type Grid = Uint8Array; // length COLS * ROWS, 0 dead / 1 alive

const SPEED_OPTIONS = [
  { label: "1x", ms: 220 },
  { label: "2x", ms: 110 },
  { label: "5x", ms: 50 },
] as const;

function idx(c: number, r: number): number {
  return r * COLS + c;
}

function makeEmpty(): Grid {
  return new Uint8Array(COLS * ROWS);
}

function makeRandom(density = 0.32): Grid {
  const g = new Uint8Array(COLS * ROWS);
  for (let i = 0; i < g.length; i++) g[i] = Math.random() < density ? 1 : 0;
  return g;
}

/** Pre-seeded "glider gun"-ish pattern for the initial reveal. Hand-tuned. */
function makeSeed(): Grid {
  const g = makeEmpty();
  const seeds: Array<[number, number]> = [
    // Pulsar-like cluster on the left
    [6, 8], [6, 9], [6, 10], [7, 7], [7, 11],
    [8, 6], [8, 12], [9, 6], [9, 12],
    [10, 7], [10, 11], [11, 8], [11, 9], [11, 10],
    // R-pentomino in the middle-right
    [25, 10], [26, 9], [26, 10], [26, 11], [27, 9],
    // Glider top right
    [36, 4], [37, 5], [35, 6], [36, 6], [37, 6],
  ];
  for (const [c, r] of seeds) {
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) g[idx(c, r)] = 1;
  }
  return g;
}

function step(g: Grid): Grid {
  const out = new Uint8Array(g.length);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          // Toroidal wrap — keeps gliders alive forever instead of dying at edges.
          const rr = (r + dr + ROWS) % ROWS;
          const cc = (c + dc + COLS) % COLS;
          n += g[rr * COLS + cc];
        }
      }
      const i = r * COLS + c;
      const alive = g[i] === 1;
      out[i] = alive ? (n === 2 || n === 3 ? 1 : 0) : n === 3 ? 1 : 0;
    }
  }
  return out;
}

function countAlive(g: Grid): number {
  let n = 0;
  for (let i = 0; i < g.length; i++) n += g[i];
  return n;
}

export function GameOfLife() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [grid, setGrid] = useState<Grid>(() => makeSeed());
  const [running, setRunning] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [generation, setGeneration] = useState(0);
  const [touched, setTouched] = useState(false);

  const paintingRef = useRef<"add" | "remove" | null>(null);
  const lastCellRef = useRef<number>(-1);

  // ── Draw ────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = wrap.clientWidth;
    const cssH = wrap.clientHeight;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background.
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, cssW, cssH);

    const cellW = cssW / COLS;
    const cellH = cssH / ROWS;

    // Grid lines (subtle).
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < COLS; c++) {
      const x = Math.round(c * cellW) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssH);
    }
    for (let r = 1; r < ROWS; r++) {
      const y = Math.round(r * cellH) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(cssW, y);
    }
    ctx.stroke();

    // Alive cells: glow underlay first, then solid core.
    ctx.fillStyle = ALIVE_GLOW;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r * COLS + c] === 1) {
          ctx.fillRect(c * cellW - 1, r * cellH - 1, cellW + 2, cellH + 2);
        }
      }
    }
    ctx.fillStyle = ALIVE_COLOR;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r * COLS + c] === 1) {
          ctx.fillRect(
            c * cellW + 1,
            r * cellH + 1,
            Math.max(1, cellW - 2),
            Math.max(1, cellH - 2),
          );
        }
      }
    }
  }, [grid]);

  // Repaint on grid change + on resize.
  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => draw();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [draw]);

  // ── Simulation loop ─────────────────────────────────
  useEffect(() => {
    if (!running || reduced) return;
    const ms = SPEED_OPTIONS[speedIdx].ms;
    const id = setInterval(() => {
      setGrid((g) => {
        const next = step(g);
        // Halt automatically if the pattern died out.
        if (countAlive(next) === 0) {
          setRunning(false);
        }
        return next;
      });
      setGeneration((n) => n + 1);
    }, ms);
    return () => clearInterval(id);
  }, [running, speedIdx, reduced]);

  // ── Pointer-based painting ──────────────────────────
  const cellFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): number | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor((x / rect.width) * COLS);
    const r = Math.floor((y / rect.height) * ROWS);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null;
    return idx(c, r);
  };

  const togglePaint = (cellIdx: number, mode: "add" | "remove") => {
    setGrid((g) => {
      const next = new Uint8Array(g);
      next[cellIdx] = mode === "add" ? 1 : 0;
      return next;
    });
    setTouched(true);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cellIdx = cellFromEvent(e);
    if (cellIdx == null) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const mode = grid[cellIdx] === 1 ? "remove" : "add";
    paintingRef.current = mode;
    lastCellRef.current = cellIdx;
    togglePaint(cellIdx, mode);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!paintingRef.current) return;
    const cellIdx = cellFromEvent(e);
    if (cellIdx == null || cellIdx === lastCellRef.current) return;
    lastCellRef.current = cellIdx;
    togglePaint(cellIdx, paintingRef.current);
  };

  const onPointerUp = () => {
    paintingRef.current = null;
    lastCellRef.current = -1;
  };

  // ── Controls ────────────────────────────────────────
  const handlePlay = () => setRunning((r) => !r);
  const handleStep = () => {
    setGrid((g) => step(g));
    setGeneration((n) => n + 1);
    setTouched(true);
  };
  const handleRandom = () => {
    setGrid(makeRandom());
    setGeneration(0);
    setTouched(true);
  };
  const handleClear = () => {
    setGrid(makeEmpty());
    setGeneration(0);
    setRunning(false);
  };

  const alive = countAlive(grid);

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <span className={styles.barDot} />
        <span className={styles.barTitle}>game of life · play</span>
        <span className={styles.barSpacer} />
        <span className={styles.barMeta}>
          gen <strong>{generation}</strong> · alive <strong>{alive}</strong>
        </span>
      </div>

      <div className={styles.boardWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.board}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          aria-label="Conway's Game of Life — click or drag cells to paint, then press play"
        />
        {!touched && !running && (
          <div className={styles.hint}>
            <span>click cells, then press <kbd>play</kbd></span>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.btn} ${running ? "" : styles.primary}`}
          onClick={handlePlay}
          disabled={reduced || (alive === 0 && !running)}
        >
          {running ? "pause" : "play"}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.ghost}`}
          onClick={handleStep}
          disabled={running || reduced || alive === 0}
          aria-label="Advance one generation"
        >
          step
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.ghost}`}
          onClick={handleRandom}
          aria-label="Randomize the board"
        >
          random
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.ghost}`}
          onClick={handleClear}
          aria-label="Clear the board"
        >
          clear
        </button>

        <span className={styles.spacer} />

        <span className={styles.speed}>
          <span>speed</span>
          <span className={styles.speedBtns} role="radiogroup" aria-label="Simulation speed">
            {SPEED_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                role="radio"
                aria-checked={speedIdx === i}
                className={`${styles.speedBtn} ${speedIdx === i ? styles.active : ""}`}
                onClick={() => setSpeedIdx(i)}
              >
                {opt.label}
              </button>
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
