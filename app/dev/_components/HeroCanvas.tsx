"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type * as THREE from "three";
import { useDeviceTier } from "./shared/useDeviceTier";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import { PARTICLES_BY_TIER } from "./shared/tokens";

/**
 * Hero signature visual — a slow, quiet field of drifting particles linked by
 * faint distance-attenuated lines. Calm by design: the page has plenty of
 * dynamic elements further down (agent ticker, game of life). The hero is
 * background ambience, not the main act.
 *
 * @MX:ANCHOR: Frame-loop hot path. Typed-array mutation only.
 * @MX:REASON: Per-frame allocation would stall GC and disturb the live FPS
 *             telemetry shown in the footer.
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 REQ-DEV-E-001, REQ-DEV-E-004
 */

const LINKS_PER_NODE = 3;
const LINK_FADE_DISTANCE = 0.6;
const LINE_COLOR_RGB = { r: 0.22, g: 0.85, b: 1.0 }; // #38d9ff normalized
const POINT_COLOR = "#7fe4ff";

// Speed multiplier for everything — drop further to slow the field down more.
const TIME_SCALE = 0.45;

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
  const initialized = useRef(false);

  const { positions, velocities, neighborIndices, linePositions, lineColors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 3.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
      // Half the original speed.
      velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
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

    const dt = Math.min(delta, 0.05) * TIME_SCALE;
    const mx = pointer.x * 1.6;
    const my = pointer.y * 1.0;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      positions[ix + 0] += velocities[ix + 0] * dt * 30;
      positions[ix + 1] += velocities[ix + 1] * dt * 30;
      positions[ix + 2] += velocities[ix + 2] * dt * 30;

      if (positions[ix + 0] > 1.7 || positions[ix + 0] < -1.7) velocities[ix + 0] *= -1;
      if (positions[ix + 1] > 1.1 || positions[ix + 1] < -1.1) velocities[ix + 1] *= -1;
      if (positions[ix + 2] > 0.75 || positions[ix + 2] < -0.75) velocities[ix + 2] *= -1;

      // Gentle pointer pull — present but not aggressive.
      const dx = mx - positions[ix + 0];
      const dy = my - positions[ix + 1];
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 0.5) {
        const pull = 0.018 / (dist2 + 0.15);
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
          size={0.014}
          color={POINT_COLOR}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.55} depthWrite={false} />
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
      camera={{ position: [0, 0, 2.4], fov: 60 }}
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
