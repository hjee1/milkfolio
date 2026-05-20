"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RobotPet.module.css";

/**
 * RobotPet — fixed-position character that reacts to hovered hotspots.
 *
 * Any element on the page with a `data-robot-message="..."` attribute becomes
 * a hotspot. When the visitor mouses over it, the robot's speech bubble
 * appears and types the message character-by-character. When the visitor
 * leaves, the bubble lingers until the message has finished typing, plus a
 * short tail of dwell time.
 *
 * Implementation notes:
 *   - DOM-level event listeners on document — no React Context plumbing required.
 *     Any markup in the tree can opt in by adding the data attribute.
 *   - The robot itself has `pointer-events: none` so it never blocks underlying
 *     clicks or hovers (including the page's WebGL canvas).
 *   - Reduced motion: bubble still appears but the character is still and the
 *     "typing" reduces to an instant full-text render.
 *
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 — Turn 6 (interactive scroll companion)
 */

const TYPING_SPEED = 22; // ms per character
const POST_TYPE_HOLD = 1100; // ms to keep bubble visible after typing finishes
const HOVER_LEAVE_HOLD = 700; // ms after mouseleave before scheduling hide

export function RobotPet() {
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [excited, setExcited] = useState(false);

  const currentHotspotRef = useRef<HTMLElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excitedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(false);

  // Detect reduced-motion once on mount.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // ── DOM-level hover detection ─────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;

    const startMessage = (message: string) => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      setActiveMessage(message);
      setBubbleVisible(true);

      // Excited little jump on every new hotspot.
      setExcited(true);
      if (excitedTimerRef.current) clearTimeout(excitedTimerRef.current);
      excitedTimerRef.current = setTimeout(() => setExcited(false), 500);

      // Type out, or dump everything at once for reduced motion.
      if (reducedMotionRef.current) {
        setTyped(message);
        return;
      }

      let i = 0;
      setTyped("");
      const tick = () => {
        i++;
        setTyped(message.slice(0, i));
        if (i < message.length) {
          typingTimerRef.current = setTimeout(tick, TYPING_SPEED);
        }
      };
      tick();
    };

    const scheduleHide = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      // Wait long enough that the user can keep reading after pulling the cursor away.
      hideTimerRef.current = setTimeout(() => {
        setBubbleVisible(false);
      }, HOVER_LEAVE_HOLD + POST_TYPE_HOLD);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const hotspot = target.closest<HTMLElement>("[data-robot-message]");
      if (!hotspot) return;
      if (hotspot === currentHotspotRef.current) return;
      currentHotspotRef.current = hotspot;
      const message = hotspot.getAttribute("data-robot-message");
      if (message) startMessage(message);
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const hotspot = target.closest<HTMLElement>("[data-robot-message]");
      if (!hotspot) return;

      // The related target check stops onMouseOut firing when the cursor moves
      // between child elements inside the same hotspot.
      const next = e.relatedTarget as HTMLElement | null;
      if (next && hotspot.contains(next)) return;

      if (currentHotspotRef.current === hotspot) {
        currentHotspotRef.current = null;
        scheduleHide();
      }
    };

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (excitedTimerRef.current) clearTimeout(excitedTimerRef.current);
    };
  }, []);

  const stillTyping =
    activeMessage != null && typed.length < activeMessage.length && !reducedMotionRef.current;

  return (
    <div className={styles.root} aria-hidden="true">
      {/* Speech bubble — sits above the character */}
      <div
        className={`${styles.bubble} ${bubbleVisible && activeMessage ? styles.visible : ""}`}
      >
        {typed}
        {stillTyping && <span className={styles.cursor} />}
      </div>

      {/* Character */}
      <div className={`${styles.character} ${excited ? styles.excited : ""}`}>
        <svg
          className={styles.svg}
          viewBox="0 0 100 110"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Antenna */}
          <line
            x1="50"
            y1="22"
            x2="50"
            y2="8"
            stroke="#38d9ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle className={styles.antennaTip} cx="50" cy="6" r="4" />

          {/* Head */}
          <rect
            x="18"
            y="22"
            width="64"
            height="52"
            rx="10"
            fill="#0a0f1a"
            stroke="#38d9ff"
            strokeWidth="2"
          />

          {/* Visor stripe — gives the head some life */}
          <line
            x1="18"
            y1="36"
            x2="82"
            y2="36"
            stroke="rgba(56, 217, 255, 0.18)"
            strokeWidth="1"
          />

          {/* Eyes */}
          <circle
            className={`${styles.eye} ${styles.blinking}`}
            cx="36"
            cy="48"
            r="5"
          />
          <circle
            className={`${styles.eye} ${styles.blinking} ${styles.secondary}`}
            cx="64"
            cy="48"
            r="5"
          />

          {/* Mouth */}
          <rect
            className={`${styles.mouth} ${stillTyping ? styles.talking : ""}`}
            x="40"
            y="60"
            width="20"
            height="4"
            rx="1"
            fill="#38d9ff"
            style={{ transformOrigin: "50px 62px" }}
          />

          {/* Body */}
          <rect
            x="30"
            y="78"
            width="40"
            height="22"
            rx="4"
            fill="#060912"
            stroke="#38d9ff"
            strokeWidth="1.5"
          />
          {/* Body LEDs */}
          <circle cx="40" cy="89" r="1.5" fill="#38d9ff" />
          <circle cx="50" cy="89" r="1.5" fill="rgba(56, 217, 255, 0.4)" />
          <circle cx="60" cy="89" r="1.5" fill="#38d9ff" />

          {/* Arms */}
          <line
            x1="18"
            y1="84"
            x2="28"
            y2="86"
            stroke="#38d9ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="82"
            y1="84"
            x2="72"
            y2="86"
            stroke="#38d9ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
