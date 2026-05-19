import styles from "./Hero.module.css";

/**
 * Static fallback rendered when WebGL2 is unavailable OR while the R3F bundle
 * is being lazy-loaded. SVG-based, server-safe, ~2KB.
 *
 * Visually echoes the dynamic version: a sparse DAG-like topology of nodes
 * connected by lines, but baked into static geometry.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-O-002
 */
export function HeroFallback() {
  return (
    <div className={styles.fallback} aria-hidden="true">
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38d9ff" stopOpacity="1" />
            <stop offset="40%" stopColor="#38d9ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38d9ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lineFade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38d9ff" stopOpacity="0.0" />
            <stop offset="50%" stopColor="#38d9ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38d9ff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Connection lines — drawn first so nodes layer above */}
        {FALLBACK_EDGES.map(([a, b], i) => {
          const na = FALLBACK_NODES[a];
          const nb = FALLBACK_NODES[b];
          return (
            <line
              key={i}
              x1={na[0]}
              y1={na[1]}
              x2={nb[0]}
              y2={nb[1]}
              stroke="url(#lineFade)"
              strokeWidth="1"
            />
          );
        })}

        {/* Node halos */}
        {FALLBACK_NODES.map(([x, y, r], i) => (
          <circle key={`halo-${i}`} cx={x} cy={y} r={r * 4} fill="url(#nodeGlow)" />
        ))}

        {/* Node cores */}
        {FALLBACK_NODES.map(([x, y, r], i) => (
          <circle
            key={`core-${i}`}
            cx={x}
            cy={y}
            r={r}
            fill="#7fe4ff"
            opacity={0.9}
          />
        ))}
      </svg>
    </div>
  );
}

// Hand-tuned positions for a balanced, dag-ish layout.
// [x, y, radius]
const FALLBACK_NODES: Array<[number, number, number]> = [
  [120, 140, 3],
  [220, 90, 2],
  [310, 200, 4],
  [180, 280, 2.5],
  [400, 130, 3],
  [490, 230, 3.5],
  [380, 340, 2.5],
  [560, 320, 3],
  [640, 180, 2.5],
  [700, 280, 3],
  [620, 420, 2.5],
  [460, 460, 3],
  [320, 430, 2.5],
  [200, 480, 2],
  [100, 380, 2.5],
];

// Edges as pairs of node indices.
const FALLBACK_EDGES: Array<[number, number]> = [
  [0, 1], [0, 3], [1, 2], [1, 4], [2, 3], [2, 5], [3, 6],
  [4, 5], [4, 8], [5, 6], [5, 7], [6, 11], [7, 8], [7, 10],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14],
  [14, 0], [3, 14], [12, 6],
];
