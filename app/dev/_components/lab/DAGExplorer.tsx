"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";
import styles from "../Lab.module.css";

/**
 * DAG Explorer — a draggable miniature pipeline. Six abstract stages, eight
 * directed edges, particles that flow along the edges to suggest movement.
 *
 * Drag nodes to rearrange. The edges keep up. The flow keeps flowing.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-003, REQ-DEV-S-003
 */

type Node = { id: string; label: string; x: number; y: number };
type Edge = [string, string];

const INITIAL_NODES: Node[] = [
  { id: "src",    label: "source",    x: 14, y: 50 },
  { id: "parse",  label: "parse",     x: 32, y: 26 },
  { id: "valid",  label: "validate",  x: 32, y: 74 },
  { id: "enrich", label: "enrich",    x: 54, y: 50 },
  { id: "score",  label: "score",     x: 74, y: 26 },
  { id: "sink",   label: "publish",   x: 88, y: 60 },
];

const EDGES: Edge[] = [
  ["src", "parse"],
  ["src", "valid"],
  ["parse", "enrich"],
  ["valid", "enrich"],
  ["enrich", "score"],
  ["enrich", "sink"],
  ["score", "sink"],
];

// Width/height units are arbitrary — we use 0-100 viewBox space.
const VIEW_W = 100;
const VIEW_H = 100;
const NODE_RADIUS = 4.5;

export function DAGExplorer() {
  const reduced = usePrefersReducedMotion();
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animate flow particles along edges.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (now - last >= 33) {
        // ~30Hz is plenty for this; cheaper than 60.
        last = now;
        setTick((t) => (t + 1) % 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const nodeById = (id: string) => nodes.find((n) => n.id === id)!;

  const svgPoint = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * VIEW_W;
    const y = ((clientY - rect.top) / rect.height) * VIEW_H;
    return { x, y };
  };

  const startDrag = (id: string, clientX: number, clientY: number) => {
    const p = svgPoint(clientX, clientY);
    if (!p) return;
    const node = nodeById(id);
    draggingRef.current = {
      id,
      offsetX: node.x - p.x,
      offsetY: node.y - p.y,
    };
    setActiveNode(id);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!draggingRef.current) return;
    const p = svgPoint(clientX, clientY);
    if (!p) return;
    const { id, offsetX, offsetY } = draggingRef.current;
    const clampedX = Math.max(NODE_RADIUS + 2, Math.min(VIEW_W - NODE_RADIUS - 2, p.x + offsetX));
    const clampedY = Math.max(NODE_RADIUS + 2, Math.min(VIEW_H - NODE_RADIUS - 2, p.y + offsetY));
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: clampedX, y: clampedY } : n)),
    );
  };

  const endDrag = () => {
    draggingRef.current = null;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onUp = () => endDrag();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Keyboard handler: arrow keys move the selected node 2 units.
  const onKeyDown = (e: React.KeyboardEvent<SVGCircleElement>, id: string) => {
    const step = e.shiftKey ? 6 : 2;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    if (e.key === "ArrowRight") dx = step;
    if (e.key === "ArrowUp") dy = -step;
    if (e.key === "ArrowDown") dy = step;
    if (dx === 0 && dy === 0) return;
    e.preventDefault();
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              x: Math.max(NODE_RADIUS + 2, Math.min(VIEW_W - NODE_RADIUS - 2, n.x + dx)),
              y: Math.max(NODE_RADIUS + 2, Math.min(VIEW_H - NODE_RADIUS - 2, n.y + dy)),
            }
          : n,
      ),
    );
  };

  const reset = () => setNodes(INITIAL_NODES);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>DAG Explorer</span>
        <span className={styles.cardIndex}>03 / 03</span>
      </div>
      <h3 className={styles.cardTitle}>The shape of a pipeline.</h3>
      <p className={styles.cardDesc}>
        Six abstract stages, eight directed edges, packets flowing along them.
        Drag the nodes around — the topology survives.
      </p>
      <div className={styles.cardCanvas}>
        <svg
          ref={svgRef}
          className={styles.dagSvg}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-label="Interactive pipeline graph. Use Tab to focus a node, then arrow keys to move it."
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38d9ff" opacity="0.7" />
            </marker>
            <radialGradient id="nodeFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7fe4ff" />
              <stop offset="100%" stopColor="#0d6e8a" />
            </radialGradient>
          </defs>

          {/* Edges */}
          {EDGES.map(([a, b], i) => {
            const na = nodeById(a);
            const nb = nodeById(b);
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="rgba(56, 217, 255, 0.35)"
                  strokeWidth="0.4"
                  markerEnd="url(#arrow)"
                />
                {!reduced && (
                  <FlowDot
                    fromX={na.x}
                    fromY={na.y}
                    toX={nb.x}
                    toY={nb.y}
                    phase={(tick + i * 13) % 100}
                  />
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const isActive = activeNode === n.id;
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_RADIUS}
                  fill="url(#nodeFill)"
                  stroke="#38d9ff"
                  strokeWidth={isActive ? "0.6" : "0.3"}
                  className={styles.dagNode}
                  tabIndex={0}
                  onMouseDown={(e) => startDrag(n.id, e.clientX, e.clientY)}
                  onFocus={() => setActiveNode(n.id)}
                  onBlur={() => setActiveNode((cur) => (cur === n.id ? null : cur))}
                  onKeyDown={(e) => onKeyDown(e, n.id)}
                  aria-label={`Pipeline stage: ${n.label}`}
                />
                <text
                  x={n.x}
                  y={n.y + NODE_RADIUS + 4}
                  textAnchor="middle"
                  className={`${styles.dagNodeLabel} ${isActive ? styles.active : ""}`}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
        <span className={styles.dagHint}>drag · or tab + arrow keys</span>
      </div>
      <div className={styles.cardControls}>
        <button
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={reset}
          aria-label="Reset node positions"
        >
          reset layout
        </button>
        <span className={styles.statusLine}>
          {reduced ? "static · reduced motion" : "flowing"}
        </span>
      </div>
    </article>
  );
}

/**
 * Small dot that travels along the segment a→b. Phase 0-99 maps to
 * 0%-100% of the edge. Used purely for atmosphere; pointer-events: none.
 */
function FlowDot({
  fromX,
  fromY,
  toX,
  toY,
  phase,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  phase: number;
}) {
  const t = phase / 100;
  const x = fromX + (toX - fromX) * t;
  const y = fromY + (toY - fromY) * t;
  // Fade in/out near edge endpoints so dots don't appear to pile up at nodes.
  const fadeIn = Math.min(1, t * 6);
  const fadeOut = Math.min(1, (1 - t) * 6);
  const opacity = Math.min(fadeIn, fadeOut) * 0.9;
  return (
    <circle
      cx={x}
      cy={y}
      r="0.8"
      fill="#7fe4ff"
      opacity={opacity}
      style={{ filter: "drop-shadow(0 0 1.5px #38d9ff)" }}
      pointerEvents="none"
    />
  );
}
