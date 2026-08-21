"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import styles from "./ConceptCarousel.module.css";

const AUTO_ROTATE_MS = 4500;

type ConceptCarouselProps = {
  conceptId: string;
  /** 1장 이상. 1장이면 정적 표시 (네비/도트/auto-rotate 모두 차단). */
  images: string[];
  /** alt 텍스트 base — 카루셀이 인덱스를 붙여서 사용. */
  altBase: string;
};

/**
 * /actor PhotoConcepts — 컨셉별 사진 캐러셀 (Client Component).
 *
 * Responsibilities:
 *   - images.length === 1: 정적 portrait (네비 / dot / auto-rotate 모두 비활성)
 *   - images.length >= 2: 화살표 prev/next + dot indicator + auto-rotate
 *   - 키보드: 좌/우 화살표 키로 이동 (탭 포커스 시)
 *   - hover/focus: auto-rotate 일시정지
 *   - prefers-reduced-motion: auto-rotate 영구 정지 + transition opacity 단축
 *
 * Hydration 안전:
 *   - 초기 index는 항상 0 (SSR/CSR 일치)
 *   - reduced-motion 검출은 useEffect 첫 실행에서만 (hydration mismatch 0)
 *
 * @MX:NOTE: [AUTO] 단일 이미지 분기는 length===1로 내부에서 판단되어
 *           PhotoConcepts(server)가 분기 코드를 가지지 않게 한다. 향후
 *           직장인 컨셉이 2장 이상이 되면 자동으로 carousel로 승격.
 */
export function ConceptCarousel({
  conceptId,
  images,
  altBase,
}: ConceptCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isMulti = images.length > 1;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (!isMulti) return;
      const wrapped = ((next % images.length) + images.length) % images.length;
      setIndex(wrapped);
    },
    [images.length, isMulti],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // auto-rotate — multi + !reducedMotion + !isPaused에서만 작동.
  // cleanup은 항상 호출되어 unmount/state 변경 시 timer leak 방지.
  useEffect(() => {
    if (!isMulti) return;
    if (reducedMotion) return;
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setIndex((curr) => (curr + 1) % images.length);
    }, AUTO_ROTATE_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isMulti, reducedMotion, isPaused, images.length]);

  // 키보드 화살표 — 컨테이너 포커스 시 좌/우로 이동.
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!isMulti) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    },
    [isMulti, next, prev],
  );

  return (
    <div
      className={styles.root}
      data-multi={isMulti ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      role={isMulti ? "region" : undefined}
      aria-label={isMulti ? `${altBase} 캐러셀` : undefined}
      aria-roledescription={isMulti ? "carousel" : undefined}
      tabIndex={isMulti ? 0 : -1}
      onMouseEnter={() => isMulti && setIsPaused(true)}
      onMouseLeave={() => isMulti && setIsPaused(false)}
      onFocus={() => isMulti && setIsPaused(true)}
      onBlur={() => isMulti && setIsPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div className={styles.slides} aria-live={isMulti ? "polite" : undefined}>
        {images.map((src, i) => {
          const active = i === index;
          return (
            <Image
              key={src}
              src={src}
              alt={`${altBase} ${i + 1}`}
              className={styles.slide}
              data-active={active ? "true" : "false"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          );
        })}
      </div>

      {isMulti ? (
        <>
          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            aria-label="이전 사진"
            onClick={prev}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12.5 4L6.5 10l6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            aria-label="다음 사진"
            onClick={next}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M7.5 4l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <ol
            className={styles.dots}
            aria-label={`${altBase} 사진 ${images.length}장 중 ${index + 1}번째`}
          >
            {images.map((src, i) => (
              <li key={src} className={styles.dotItem}>
                <button
                  type="button"
                  className={styles.dot}
                  data-active={i === index ? "true" : "false"}
                  aria-label={`${i + 1}번째 사진으로 이동`}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => goTo(i)}
                />
              </li>
            ))}
          </ol>

          {/* 카운터 — sr-only로 현재 위치 안내 (REQ-ACT-S-003 보조) */}
          <p className={styles.counter}>
            <span className={styles.counterCurrent}>{index + 1}</span>
            <span className={styles.counterSep} aria-hidden="true">
              {" / "}
            </span>
            <span className={styles.counterTotal}>{images.length}</span>
          </p>
        </>
      ) : null}

      {/* 개발용 식별자 — E2E에서 컨셉을 특정할 수 있도록 data 속성만 노출 */}
      <span
        aria-hidden="true"
        hidden
        data-concept-id={conceptId}
      />
    </div>
  );
}
