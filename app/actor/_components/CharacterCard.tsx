"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterCard as CharacterCardData } from "../data";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import styles from "./CharacterCard.module.css";

/**
 * sessionStorage 키 — 모바일 첫 세션 chevron hint 가드 (REQ-ACT-O-005).
 * 사용자가 어떤 카드든 한 번 탭하면 "true"로 저장되고, 같은 세션 동안 모든
 * 카드의 chevron이 사라진다.
 *
 * @MX:NOTE: [AUTO] localStorage / document.cookie 사용 0 (REQ-ACT-N-002).
 *           외부 분석 스크립트도 0. 모든 client state는 sessionStorage만.
 */
const STORAGE_KEY = "actor.roles.cardTapped";

/**
 * 동일 페이지의 다른 CharacterCard 인스턴스들에게 "첫 탭 발생"을 알리는
 * window CustomEvent 이름. mount된 모든 카드가 listener를 걸어두고 한 번의
 * 탭으로 일제히 chevron을 사라지게 한다.
 */
const FIRST_TAP_EVENT = "actor:firstRoleCardTap";

type CharacterCardProps = {
  card: CharacterCardData;
};

/**
 * /actor Roles — 단일 character card (Client Component).
 *
 * Responsibilities:
 *   - flippable 카드 (cardKind !== "placeholder")는 <button>으로 렌더되어
 *     hover(desktop) / tap(mobile) / Enter·Space(keyboard) 모두에서 3D flip
 *     transform을 트리거한다.
 *     · Desktop hover는 CSS `:hover`로만 발화 (JS state 없이도 시각 효과).
 *     · Mobile tap / keyboard는 React state(`isFlipped`)로 발화. 두 경로는
 *       같은 `[data-flipped="true"]` 셀렉터에 같은 transform을 적용한다.
 *   - placeholder 카드(cardKind === "placeholder")는 button이 아닌 정적
 *     <article>로 렌더되어 인터랙션이 비활성된다 (REQ-ACT-E-005).
 *   - prefers-reduced-motion 활성 시 3D transform 대신 opacity fade로 대체
 *     (REQ-ACT-S-001). data-reduced-motion="true"가 CSS에서 transform: none
 *     + transition: opacity로 단락시킨다.
 *   - coverImage === null인 카드는 typographic placeholder front face를
 *     렌더한다 (REQ-ACT-O-003). cardKind별로 라벨이 달라진다:
 *       placeholder      → "준비 중"
 *       low-quality-still→ "still 준비 중"
 *       poster           → "포스터 준비 중"
 *   - 모바일 첫 세션(터치 + viewport <768px + sessionStorage 키 미설정)
 *     에서는 flippable 카드 우측 하단에 작은 gold chevron SVG를 표시한다
 *     (REQ-ACT-O-005). 어떤 카드든 한 번 탭되면 window CustomEvent를
 *     dispatch하여 같은 페이지의 모든 카드가 chevron을 동기 hide한다.
 *
 * Hydration 안전:
 *   - 초기 render는 isFlipped=false / showChevron=false로 고정 (SSR 일치).
 *   - useEffect 첫 실행에서 matchMedia + sessionStorage를 evaluate해 chevron
 *     visibility만 클라이언트에서 적용한다 → hydration mismatch 0
 *     (REQ-ACT-N-007).
 *
 * @MX:ANCHOR: [AUTO] /actor Roles 카드 인터랙션 진입점. fan_in: Roles.tsx +
 *             e2e/actor.spec.ts 회귀 + data.ts CHARACTER_CARDS = 3.
 * @MX:REASON: 3D flip + chevron hint + reduced-motion 분기 + sessionStorage
 *             가드가 동시에 깨지면 캐스팅 디렉터의 30초 윈도우가 깨지고,
 *             모바일 사용자에게 인터랙션 발견 가능성이 사라진다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-E-004, REQ-ACT-E-005,
 *           REQ-ACT-S-001, REQ-ACT-S-003, REQ-ACT-O-003, REQ-ACT-O-005,
 *           REQ-ACT-N-002, REQ-ACT-N-007
 */
export function CharacterCard({ card }: CharacterCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isPlaceholder = card.cardKind === "placeholder";
  const isFlippable = !isPlaceholder;

  const [isFlipped, setIsFlipped] = useState(false);
  const [showChevron, setShowChevron] = useState(false);
  const hasFiredFirstTap = useRef(false);

  // mount 시점에 모바일 + 첫 세션 + flippable 조건을 평가하여 chevron 가시화.
  // SSR 단계는 showChevron=false이므로 hydration mismatch 0.
  //
  // @MX:WARN: [AUTO] window 'actor:firstRoleCardTap' custom event listener는
  //           cleanup에서 반드시 removeEventListener. sessionStorage는
  //           try/catch (private mode).
  // @MX:REASON: cleanup 누락 시 unmount된 카드에서 state setter 호출로 React
  //             warning. sessionStorage exception 시 chevron이 영구 표시되어
  //             hint 노이즈가 된다.
  useEffect(() => {
    if (!isFlippable) return;
    if (typeof window === "undefined" || !window.matchMedia) return;

    const isMobileViewport = window.matchMedia(
      "(max-width: 767.98px)",
    ).matches;

    let alreadyTapped = false;
    try {
      alreadyTapped =
        window.sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // sessionStorage 접근 실패 (private mode) → chevron 미표시로 안전 단락.
      alreadyTapped = true;
    }

    if (isMobileViewport && !alreadyTapped) {
      setShowChevron(true);
    }

    const onFirstTap = () => {
      setShowChevron(false);
    };
    window.addEventListener(FIRST_TAP_EVENT, onFirstTap);
    return () => {
      window.removeEventListener(FIRST_TAP_EVENT, onFirstTap);
    };
  }, [isFlippable]);

  const handleToggleFlip = useCallback(() => {
    if (!isFlippable) return;
    setIsFlipped((prev) => !prev);

    // 첫 탭이라면 sessionStorage 저장 + 페이지 전역 chevron 일제 hide.
    if (!hasFiredFirstTap.current) {
      hasFiredFirstTap.current = true;
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "true");
        } catch {
          // 저장 실패는 무시 (REQ-ACT-N-002 — localStorage fallback 금지).
        }
        try {
          window.dispatchEvent(new CustomEvent(FIRST_TAP_EVENT));
        } catch {
          // CustomEvent 미지원 환경은 무시 — chevron이 그대로 남지만 페이지
          // 동작은 정상.
        }
      }
    }
  }, [isFlippable]);

  // 카드 front 라벨 — coverImage가 없을 때 cardKind별로 typographic
  // placeholder의 상태 텍스트를 다르게 보여준다 (REQ-ACT-O-003).
  const placeholderLabel = (() => {
    switch (card.cardKind) {
      case "placeholder":
        return "준비 중";
      case "low-quality-still":
        return "still 준비 중";
      case "poster":
        return "포스터 준비 중";
      default:
        return "준비 중";
    }
  })();

  const hasCover = card.coverImage !== null;

  // 카드 내부 마크업 (front + back). flippable과 placeholder가 공유.
  const cardInner = (
    <div className={styles.inner}>
      {/* FRONT FACE */}
      <div className={styles.face} data-face="front" aria-hidden={isFlipped}>
        {hasCover ? (
          <>
            <Image
              src={card.coverImage ?? ""}
              alt={`${card.characterName} (${card.workTitle}) 표지 이미지`}
              className={styles.cover}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            />
            <div className={styles.frontOverlay}>
              <p className={styles.frontWork}>
                <em>{card.workTitle}</em>
              </p>
              <p className={styles.frontCharacter}>{card.characterName}</p>
              <p className={styles.frontRoleType}>{card.roleType}</p>
            </div>
          </>
        ) : (
          <div className={styles.typoFront}>
            <p className={styles.typoYear}>{card.year}</p>
            <p className={styles.typoWork}>
              <em>{card.workTitle}</em>
            </p>
            <p className={styles.typoCharacter}>{card.characterName}</p>
            <p className={styles.typoRoleType}>{card.roleType}</p>
            <p className={styles.typoStatus}>{placeholderLabel}</p>
          </div>
        )}

        {/* Mobile-only chevron hint (REQ-ACT-O-005).
            mount 후 useEffect가 평가하여 visibility를 결정한다. 서버 출력은
            항상 hidden이라 hydration mismatch가 발생하지 않는다. */}
        {showChevron ? (
          <span
            className={styles.chevron}
            data-chevron-hint="visible"
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 3l7 5-7 5V3z" fill="#b8a98a" />
            </svg>
          </span>
        ) : null}
      </div>

      {/* BACK FACE — placeholder 카드도 형식적으로 렌더하지만 인터랙션이
          없어 시각적으로 노출되지 않는다 (placeholder는 button이 아니므로
          hover/flip 트리거 자체가 없다). */}
      <div
        className={styles.face}
        data-face="back"
        aria-hidden={!isFlipped}
      >
        <div className={styles.backInner}>
          <p className={styles.backWork}>
            <em>{card.workTitle}</em>
          </p>
          <p className={styles.backCharacter}>
            <span className={styles.backCharacterName}>
              {card.characterName}
            </span>
            <span className={styles.backRoleType}>{card.roleType}</span>
          </p>

          {card.stills.length > 0 ? (
            <ul className={styles.stillsGrid}>
              {card.stills.map((src, idx) => (
                <li key={src} className={styles.stillItem}>
                  <Image
                    src={src}
                    alt={`${card.characterName} 스틸 ${idx + 1}`}
                    className={styles.stillImage}
                    fill
                    sizes="(max-width: 767px) 45vw, 210px"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {card.note ? (
            <p className={styles.note}>{card.note}</p>
          ) : (
            <p className={styles.noteFallback}>노트 준비 중</p>
          )}

          {card.hashtags.length > 0 ? (
            <ul className={styles.hashtags}>
              {/* data.ts hashtags already carry the leading "#" — render as-is. */}
              {card.hashtags.map((tag) => (
                <li key={tag} className={styles.hashtag}>
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );

  // placeholder는 button이 아닌 정적 article로 렌더 (REQ-ACT-E-005).
  if (!isFlippable) {
    return (
      <article
        id={`card-${card.id}`}
        className={styles.root}
        data-character-card="true"
        data-card-kind={card.cardKind}
        data-card-flippable="false"
        data-flipped="false"
        data-reduced-motion={reducedMotion ? "true" : "false"}
        aria-label={`${card.characterName} — ${card.workTitle} (${card.roleType})`}
      >
        {cardInner}
      </article>
    );
  }

  // flippable은 button — Tab/Enter/Space 키보드 인터랙션 (REQ-ACT-S-003)
  return (
    <button
      type="button"
      id={`card-${card.id}`}
      className={styles.root}
      data-character-card="true"
      data-card-kind={card.cardKind}
      data-card-flippable="true"
      data-flipped={isFlipped ? "true" : "false"}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      aria-label={`${card.characterName} — ${card.workTitle} (${card.roleType}) 카드 뒤집기`}
      aria-pressed={isFlipped}
      onClick={handleToggleFlip}
    >
      {cardInner}
    </button>
  );
}
