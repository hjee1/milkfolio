"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type * as THREE from "three";
import { useDeviceTier } from "./shared/useDeviceTier";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import { PARTICLES_BY_TIER } from "./shared/tokens";

/**
 * Hero signature visual — a drifting neural-network-like topology with
 * a slowly orbiting camera so the structure breathes instead of just floating.
 *
 * Two layered passes:
 *   1) Points cloud: N particles drifting through a bounded volume.
 *   2) Line segments: each particle keeps LINKS_PER_NODE persistent partners;
 *      edges re-vertex every frame; color attenuates with distance.
 *
 * Camera does a gentle figure-eight around z=2.0 to keep the topology alive
 * even when the user isn't moving the cursor.
 *
 * @MX:ANCHOR: Frame-loop hot path. ~60Hz desktop. Typed-array mutation only.
 * @MX:REASON: Per-frame allocation would stall the GC and tank the live FPS
 *             that the Hero board and Footer telemetry display in real time.
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-001, REQ-DEV-E-004, REQ-DEV-D3
 */

const LINKS_PER_NODE = 3;
const LINK_FADE_DISTANCE = 1.4; // World units. Was 0.6 — wider so lines stay visible.
const LINE_COLOR_RGB = { r: 0.22, g: 0.85, b: 1.0 }; // #38d9ff normalized
const POINT_COLOR = "#a3eaff"; // slightly brighter than #7fe4ff

function ParticleField({
  count,
  reducedMotion,
}: {
  count: number;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const lineRef = useRef<THREE.LineSegments>(null!);
  const pointer = useThree((s) => s.pointer);
  const camera = useThree((s) => s.camera);
  const initialized = useRef(false);
  const elapsedRef = useRef(0);

  const { positions, velocities, neighborIndices, linePositions, lineColors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 3.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }

    const neighborIndices = new Int32Array(count * LINKS_PER_NODE);
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < LINKS_PER_NODE; j++) {
        let n = Math.floor(Math.random() * count);
        if (n === i) n = (n + 1) % count;
        neighborIndices[i * LINKS_PER_NODE + j] = n;
      }
    }

    const linePositions = new Float32Array(count * LINKS_PER_NODE * 2 * 3);
    const lineColors = new Float32Array(count * LINKS_PER_NODE * 2 * 3);
    return { positions, velocities, neighborIndices, linePositions, lineColors };
  }, [count]);

  const recomputeLines = () => {
    let li = 0;
    for (let i = 0; i < count; i++) {
      const ax = positions[i * 3 + 0];
      const ay = positions[i * 3 + 1];
      const az = positions[i * 3 + 2];
      for (let j = 0; j < LINKS_PER_NODE; j++) {
        const n = neighborIndices[i * LINKS_PER_NODE + j];
        const bx = positions[n * 3 + 0];
        const by = positions[n * 3 + 1];
        const bz = positions[n * 3 + 2];

        linePositions[li + 0] = ax;
        linePositions[li + 1] = ay;
        linePositions[li + 2] = az;
        linePositions[li + 3] = bx;
        linePositions[li + 4] = by;
        linePositions[li + 5] = bz;

        const dx = bx - ax;
        const dy = by - ay;
        const dz = bz - az;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const t = Math.max(0, 1 - d / LINK_FADE_DISTANCE);
        const r = LINE_COLOR_RGB.r * t;
        const g = LINE_COLOR_RGB.g * t;
        const b = LINE_COLOR_RGB.b * t;

        lineColors[li + 0] = r;
        lineColors[li + 1] = g;
        lineColors[li + 2] = b;
        lineColors[li + 3] = r;
        lineColors[li + 4] = g;
        lineColors[li + 5] = b;

        li += 6;
      }
    }
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    const lineGeom = lineRef.current.geometry;
    (lineGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (lineGeom.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  };

  useFrame((_state, delta) => {
    if (reducedMotion) {
      if (initialized.current) return;
      initialized.current = true;
      recomputeLines();
      return;
    }

    const dt = Math.min(delta, 0.05);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    // Slow camera orbit — figure-eight in XY at constant Z. Keeps perspective fresh.
    camera.position.x = Math.sin(t * 0.12) * 0.35;
    camera.position.y = Math.sin(t * 0.18) * 0.18;
    camera.lookAt(0, 0, 0);

    const mx = pointer.x * 1.8;
    const my = pointer.y * 1.2;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      positions[ix + 0] += velocities[ix + 0] * dt * 30;
      positions[ix + 1] += velocities[ix + 1] * dt * 30;
      positions[ix + 2] += velocities[ix + 2] * dt * 30;

      if (positions[ix + 0] > 1.9 || positions[ix + 0] < -1.9) velocities[ix + 0] *= -1;
      if (positions[ix + 1] > 1.2 || positions[ix + 1] < -1.2) velocities[ix + 1] *= -1;
      if (positions[ix + 2] > 0.95 || positions[ix + 2] < -0.95) velocities[ix + 2] *= -1;

      // Stronger pointer attraction — the field reacts more visibly.
      const dx = mx - positions[ix + 0];
      const dy = my - positions[ix + 1];
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 0.7) {
        const pull = 0.06 / (dist2 + 0.15);
        positions[ix + 0] += dx * pull * dt;
        positions[ix + 1] += dy * pull * dt;
      }
    }

    recomputeLines();
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color={POINT_COLOR}
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.75} depthWrite={false} />
      </lineSegments>
    </>
  );
}

export function HeroCanvas() {
  const tier = useDeviceTier();
  const reducedMotion = usePrefersReducedMotion();
  const count = PARTICLES_BY_TIER[tier];

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.0], fov: 65 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: "auto" }}
    >
      <ParticleField count={count} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
