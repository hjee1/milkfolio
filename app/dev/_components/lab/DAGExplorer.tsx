"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../shared/usePrefersReducedMotion";
import styles from "./DAGExplorer.module.css";

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

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (now - last >= 33) {
        last = now;
        setTick((t) => (t + 1) % 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const nodeById = (id: string) => nodes.find((n) => n.id === id)!;

  const svgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW_W,
      y: ((clientY - rect.top) / rect.height) * VIEW_H,
    };
  };

  const startDrag = (id: string, clientX: number, clientY: number) => {
    const p = svgPoint(clientX, clientY);
    if (!p) return;
    const node = nodeById(id);
    draggingRef.current = { id, offsetX: node.x - p.x, offsetY: node.y - p.y };
    setActiveNode(id);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    if (!draggingRef.current) return;
    const p = svgPoint(clientX, clientY);
    if (!p) return;
    const { id, offsetX, offsetY } = draggingRef.current;
    const cx = Math.max(NODE_RADIUS + 2, Math.min(VIEW_W - NODE_RADIUS - 2, p.x + offsetX));
    const cy = Math.max(NODE_RADIUS + 2, Math.min(VIEW_H - NODE_RADIUS - 2, p.y + offsetY));
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x: cx, y: cy } : n)));
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onUp = () => { draggingRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<SVGCircleElement>, id: string) => {
    const step = e.shiftKey ? 6 : 2;
    let dx = 0, dy = 0;
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

  return (
    <div className={styles.root}>
      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-label="Interactive pipeline graph. Tab to focus a node, arrow keys to move."
      >
        <defs>
          <marker
            id="dagArrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38d9ff" opacity="0.7" />
          </marker>
          <radialGradient id="dagNodeFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a3eaff" />
            <stop offset="100%" stopColor="#0d6e8a" />
          </radialGradient>
        </defs>

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
                markerEnd="url(#dagArrow)"
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

        {nodes.map((n) => {
          const isActive = activeNode === n.id;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_RADIUS}
                fill="url(#dagNodeFill)"
                stroke="#38d9ff"
                strokeWidth={isActive ? "0.6" : "0.3"}
                className={styles.node}
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
                className={`${styles.label} ${isActive ? styles.active : ""}`}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

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
