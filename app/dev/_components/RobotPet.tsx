"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RobotPet.module.css";

/**
 * RobotPet — fixed-position character that reacts to hovered hotspots.
 *
 * Hover handling:
 *   Any element with `data-robot-message="..."` is a hotspot. Hover → speech
 *   bubble appears with a typewriter effect. The bubble lingers until the
 *   message finishes typing, plus a short dwell tail.
 *
 * Expression handling:
 *   The robot has a tiny mood state that periodically nudges itself:
 *     - normal:  default, blinking eyes
 *     - sleeping: after ~12s of no interaction (Zzz floats above)
 *     - love:    a brief heart-eyes pulse, ~1.8s long, rarely
 *     - talking: while a bubble is mid-type (mouth animates)
 *   Hover / mousemove / scroll wakes the robot back to normal.
 *
 * @MX:NOTE: All extra timers run in two intervals (typing + mood) plus event
 *           listeners — no per-frame loops. Page cost is negligible.
 * @MX:SPEC: SPEC-DEV-REDESIGN-001 — Turn 6 / Turn 7 (expressions)
 */

const TYPING_SPEED = 22; // ms per character
const POST_TYPE_HOLD = 1100; // ms after typing before bubble can hide
const HOVER_LEAVE_HOLD = 700; // ms after mouseleave before scheduling hide

const IDLE_MS_TO_SLEEP = 12_000; // sleep after this long of no activity
const MOOD_TICK_MS = 4_000; // re-evaluate mood this often
const LOVE_CHANCE_PER_TICK = 0.07; // ~7% per tick → bursts every ~minute
const LOVE_DURATION_MS = 1_800;

type Mood = "normal" | "sleeping" | "love";

export function RobotPet() {
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [excited, setExcited] = useState(false);
  const [mood, setMood] = useState<Mood>("normal");

  const currentHotspotRef = useRef<HTMLElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excitedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
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

    const wakeUp = () => {
      lastActivityRef.current = Date.now();
      // Don't interrupt a love burst — let it finish.
      setMood((m) => (m === "sleeping" ? "normal" : m));
    };

    const startMessage = (message: string) => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      setActiveMessage(message);
      setBubbleVisible(true);
      wakeUp();

      // Excited little jump on every new hotspot.
      setExcited(true);
      if (excitedTimerRef.current) clearTimeout(excitedTimerRef.current);
      excitedTimerRef.current = setTimeout(() => setExcited(false), 500);

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

      const next = e.relatedTarget as HTMLElement | null;
      if (next && hotspot.contains(next)) return;

      if (currentHotspotRef.current === hotspot) {
        currentHotspotRef.current = null;
        scheduleHide();
      }
    };

    const onActivity = () => wakeUp();

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mousemove", onActivity, { passive: true });
    document.addEventListener("scroll", onActivity, { passive: true });
    document.addEventListener("keydown", onActivity);

    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousemove", onActivity);
      document.removeEventListener("scroll", onActivity);
      document.removeEventListener("keydown", onActivity);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (excitedTimerRef.current) clearTimeout(excitedTimerRef.current);
      if (loveTimerRef.current) clearTimeout(loveTimerRef.current);
    };
  }, []);

  // ── Mood ticker — sleeping / love bursts ───────────────
  useEffect(() => {
    if (reducedMotionRef.current) return;
    const id = setInterval(() => {
      // Don't override love or active bubble typing.
      const stillTyping =
        activeMessage != null && typed.length < activeMessage.length;
      if (stillTyping) return;

      const idleMs = Date.now() - lastActivityRef.current;

      setMood((current) => {
        // Love bursts cancel themselves via their own timer.
        if (current === "love") return current;

        if (idleMs > IDLE_MS_TO_SLEEP) {
          return "sleeping";
        }

        // Random heart-eyes burst.
        if (current === "normal" && Math.random() < LOVE_CHANCE_PER_TICK) {
          if (loveTimerRef.current) clearTimeout(loveTimerRef.current);
          loveTimerRef.current = setTimeout(() => {
            setMood("normal");
          }, LOVE_DURATION_MS);
          return "love";
        }

        return "normal";
      });
    }, MOOD_TICK_MS);
    return () => clearInterval(id);
  }, [activeMessage, typed.length]);

  const stillTyping =
    activeMessage != null && typed.length < activeMessage.length && !reducedMotionRef.current;

  // Mouth animates while talking.
  const mouthClass = stillTyping ? styles.talking : "";

  return (
    <div className={styles.root} aria-hidden="true">
      {/* Speech bubble */}
      <div
        className={`${styles.bubble} ${bubbleVisible && activeMessage ? styles.visible : ""}`}
      >
        {typed}
        {stillTyping && <span className={styles.cursor} />}
      </div>

      {/* "Zzz" indicator when sleeping */}
      {mood === "sleeping" && (
        <div className={styles.zzz} aria-hidden="true">
          z<span>z</span>
          <span>z</span>
        </div>
      )}

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
          <line
            x1="18"
            y1="36"
            x2="82"
            y2="36"
            stroke="rgba(56, 217, 255, 0.18)"
            strokeWidth="1"
          />

          {/* Eyes — render varies by mood */}
          {mood === "normal" && (
            <>
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
            </>
          )}
          {mood === "sleeping" && (
            <>
              <path
                d="M 30 49 q 6 -4 12 0"
                stroke="#38d9ff"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 58 49 q 6 -4 12 0"
                stroke="#38d9ff"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}
          {mood === "love" && (
            <>
              {/* Heart path — left eye */}
              <path
                d="M 36 53 C 30 49, 30 43, 33 43 C 35 43, 36 45, 36 46 C 36 45, 37 43, 39 43 C 42 43, 42 49, 36 53 Z"
                fill="#ff5d8f"
                className={styles.loveEye}
              />
              <path
                d="M 64 53 C 58 49, 58 43, 61 43 C 63 43, 64 45, 64 46 C 64 45, 65 43, 67 43 C 70 43, 70 49, 64 53 Z"
                fill="#ff5d8f"
                className={styles.loveEye}
              />
            </>
          )}

          {/* Mouth — varies by mood */}
          {mood === "sleeping" ? (
            // Calm closed mouth: small flat line, no animation
            <line
              x1="46"
              y1="62"
              x2="54"
              y2="62"
              stroke="#38d9ff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ) : mood === "love" ? (
            // Smiling open mouth
            <path
              d="M 40 60 q 10 8 20 0"
              stroke="#38d9ff"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Default tiny rectangle, animates while talking
            <rect
              className={`${styles.mouth} ${mouthClass}`}
              x="40"
              y="60"
              width="20"
              height="4"
              rx="1"
              fill="#38d9ff"
              style={{ transformOrigin: "50px 62px" }}
            />
          )}

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
