"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { ReelCategory, ReelCategoryId } from "../data";
import { usePrefersReducedData } from "./shared/usePrefersReducedData";
import styles from "./ReelPlayer.module.css";

/**
 * sessionStorage key prefix — 카테고리별 마지막 선택 episode를 복원하기 위한
 * 식별자. 형식: `actor.reel.lastEpisode.{categoryId}` (REQ-ACT-E-002 / E-003).
 *
 * @MX:NOTE: [AUTO] localStorage / document.cookie 사용 0 (REQ-ACT-N-002).
 *           외부 분석 스크립트도 0. 모든 client state는 sessionStorage만.
 */
const STORAGE_PREFIX = "actor.reel.lastEpisode";

/**
 * YouTube watch / youtu.be / embed URL에서 video ID를 추출.
 * 매칭 실패 시 null. ReelPlayer가 이 값으로 iframe vs <video> 분기.
 *
 * 지원 패턴:
 *   - https://youtu.be/{id}
 *   - https://www.youtube.com/watch?v={id}
 *   - https://www.youtube.com/embed/{id}
 *   - 위 패턴에 ? 쿼리스트링이나 추가 path가 따라붙어도 11자 ID만 추출
 *
 * @MX:NOTE: [AUTO] YouTube ID는 정확히 11자 [A-Za-z0-9_-]. 호환성 위해
 *           정규식으로 좁혀서 추출하고, 그 외 입력은 null로 fail-closed.
 */
function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0] ?? "";
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const v = parsed.searchParams.get("v") ?? "";
        return /^[A-Za-z0-9_-]{11}$/.test(v) ? v : null;
      }
      const embedMatch = parsed.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

type ReelPlayerProps = {
  categories: ReelCategory[];
};

type EpisodeSelection = Record<ReelCategoryId, string>;

/**
 * /actor Reel 인터랙션 진입점 (Client Component).
 *
 * Responsibilities:
 *   - WAI-ARIA tabs 패턴: role="tablist" / role="tab" / role="tabpanel".
 *     좌/우 화살표 + Home/End + roving tabindex로 키보드 탐색 (REQ-ACT-S-003).
 *   - 카테고리별 마지막 선택 episode를 sessionStorage에서 복원
 *     (`actor.reel.lastEpisode.{categoryId}`). 첫 로드 기본은 Intro 첫 episode
 *     (REQ-ACT-E-002).
 *   - episode 선택 시 즉시 sessionStorage에 저장 + state 갱신 (REQ-ACT-E-003).
 *   - <video> 마크업은 항상 예약하되 videoUrl이 빈 문자열일 때 src를 주입하지
 *     않고 skeleton overlay를 표시한다 (REQ-ACT-O-001 / O-002). URL이 페이스트
 *     되면 markup 변경 없이 활성된다.
 *   - prefers-reduced-data 활성 시 preload="none", autoplay false
 *     (REQ-ACT-E-007).
 *   - episodes.length === 0인 카테고리 탭은 disabled + aria-disabled
 *     (REQ-ACT-O-004 가드).
 *
 * @MX:ANCHOR: [AUTO] /actor REEL 인터랙션 진입점. fan_in: Reel.tsx +
 *             e2e/actor.spec.ts 회귀 + data.ts REEL 카탈로그.
 * @MX:REASON: sessionStorage 키 형식(`actor.reel.lastEpisode.{categoryId}`) +
 *             WAI-ARIA tabs 패턴 + reduced-data preload 차단이 깨지면 캐스팅
 *             디렉터의 30초 윈도우가 깨지고, 데이터 절약 환경에서 모바일
 *             사용자에게 의도치 않은 트래픽이 발생한다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-E-002, REQ-ACT-E-003,
 *           REQ-ACT-E-007, REQ-ACT-O-001, REQ-ACT-O-002, REQ-ACT-O-004,
 *           REQ-ACT-N-001, REQ-ACT-N-002, REQ-ACT-S-003
 */
export function ReelPlayer({ categories }: ReelPlayerProps) {
  const reducedData = usePrefersReducedData();

  // 첫 탭은 Intro. categories는 SPEC상 [intro, scene, featured] 순서가 보장됨.
  const initialCategoryId: ReelCategoryId =
    (categories[0]?.id as ReelCategoryId) ?? "intro";

  // 카테고리별 기본 선택 episode (각 카테고리 첫 episode). SSR/CSR 일치 보장을
  // 위해 useState 초기값은 deterministic하게 categories에서만 산출한다.
  const defaultSelection = useMemo<EpisodeSelection>(() => {
    const seed: Partial<EpisodeSelection> = {};
    for (const cat of categories) {
      if (cat.episodes.length > 0) {
        seed[cat.id] = cat.episodes[0]!.id;
      } else {
        // 빈 카테고리는 빈 문자열로 표시. 탭 자체가 disabled되므로 활성되지
        // 않지만 record 형태 일관성을 위해 키는 유지한다.
        seed[cat.id] = "";
      }
    }
    return seed as EpisodeSelection;
  }, [categories]);

  const [activeCategoryId, setActiveCategoryId] =
    useState<ReelCategoryId>(initialCategoryId);
  const [selectedEpisode, setSelectedEpisode] =
    useState<EpisodeSelection>(defaultSelection);

  // mount 후 sessionStorage 복원. SSR 단계는 기본값을 그대로 사용하므로
  // hydration mismatch는 발생하지 않는다 (REQ-ACT-N-007).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const restored: Partial<EpisodeSelection> = {};
      for (const cat of categories) {
        const stored = window.sessionStorage.getItem(
          `${STORAGE_PREFIX}.${cat.id}`,
        );
        if (stored && cat.episodes.some((ep) => ep.id === stored)) {
          restored[cat.id] = stored;
        }
      }
      if (Object.keys(restored).length > 0) {
        setSelectedEpisode((prev) => ({ ...prev, ...restored }));
      }
    } catch {
      // sessionStorage 접근 실패는 무시 (private mode 등). 기본 동작 유지.
    }
  }, [categories]);

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // 탭 활성화. 빈 카테고리는 활성화 거부 (REQ-ACT-O-004).
  const activateCategory = useCallback(
    (categoryId: ReelCategoryId, focus: boolean = false) => {
      const target = categories.find((c) => c.id === categoryId);
      if (!target || target.episodes.length === 0) return;
      setActiveCategoryId(categoryId);
      if (focus) {
        const idx = categories.findIndex((c) => c.id === categoryId);
        tabRefs.current[idx]?.focus();
      }
    },
    [categories],
  );

  // 키보드 패턴: 좌/우 화살표 + Home/End + roving tabindex.
  const onTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      const enabled = categories
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => c.episodes.length > 0);
      if (enabled.length === 0) return;
      const positions = enabled.map(({ i }) => i);
      const currentPos = positions.indexOf(currentIndex);
      let nextPos = currentPos;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextPos = (currentPos + 1) % positions.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          nextPos = (currentPos - 1 + positions.length) % positions.length;
          break;
        case "Home":
          nextPos = 0;
          break;
        case "End":
          nextPos = positions.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      const nextIndex = positions[nextPos]!;
      const nextCat = categories[nextIndex]!;
      activateCategory(nextCat.id, true);
    },
    [categories, activateCategory],
  );

  const onSelectEpisode = useCallback(
    (categoryId: ReelCategoryId, episodeId: string) => {
      setSelectedEpisode((prev) => ({ ...prev, [categoryId]: episodeId }));
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(
            `${STORAGE_PREFIX}.${categoryId}`,
            episodeId,
          );
        } catch {
          // 저장 실패는 무시 (REQ-ACT-N-002 — localStorage fallback 금지).
        }
      }
    },
    [],
  );

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0]!;
  const activeEpisodeId =
    selectedEpisode[activeCategory.id] || activeCategory.episodes[0]?.id || "";
  const activeEpisode =
    activeCategory.episodes.find((ep) => ep.id === activeEpisodeId) ??
    activeCategory.episodes[0];
  const activeVideoUrl = activeEpisode?.videoUrl ?? "";
  const hasVideo = Boolean(activeVideoUrl);
  const youTubeId = hasVideo ? parseYouTubeId(activeVideoUrl) : null;
  const isYouTube = youTubeId !== null;

  // reduced-data → preload="none". 기본은 "metadata" (REQ-ACT-E-007).
  // YouTube iframe 분기에서는 사용되지 않지만 <video> fallback에서 사용.
  const preload: "none" | "metadata" = reducedData ? "none" : "metadata";

  // YouTube embed URL — reduced-data 활성 시 autoplay 차단, 그 외 기본도 자동
  // 재생하지 않음(rel=0, modestbranding=1). 사용자가 클릭하여 재생 (REEL은
  // 캐스팅 디렉터가 명시적으로 보고 싶은 영상만 본다는 가정).
  const youTubeSrc = youTubeId
    ? `https://www.youtube-nocookie.com/embed/${youTubeId}?rel=0&modestbranding=1&playsinline=1`
    : "";

  return (
    <div className={styles.player}>
      {/* 탭 row — WAI-ARIA tablist */}
      <div
        role="tablist"
        aria-label="릴 카테고리"
        className={styles.tablist}
      >
        {categories.map((cat, idx) => {
          const isActive = cat.id === activeCategoryId;
          const isDisabled = cat.episodes.length === 0;
          const tabId = `reel-tab-${cat.id}`;
          const panelId = `reel-panel-${cat.id}`;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => activateCategory(cat.id)}
              onKeyDown={(event) => onTabKeyDown(event, idx)}
            >
              <span className={styles.tabLabelEn}>{cat.labelEn}</span>
              <span className={styles.tabLabelKo}>{cat.labelKo}</span>
            </button>
          );
        })}
      </div>

      {/* 활성 카테고리 패널 */}
      <div
        role="tabpanel"
        id={`reel-panel-${activeCategory.id}`}
        aria-labelledby={`reel-tab-${activeCategory.id}`}
        className={styles.panel}
      >
        {/* 좌측: 플레이어 */}
        <div className={styles.stage}>
          {/*
            <video> 마크업은 항상 예약된다 (REQ-ACT-O-001). videoUrl이 빈
            문자열이면 src를 주입하지 않고 skeleton overlay를 함께 표시한다.
            URL이 페이스트되면 markup 변경 0으로 player가 활성된다.

            @MX:NOTE: [AUTO] videoUrl="" 인 episode는 REQ-ACT-O-002 skeleton.
                      URL 페이스트 후 markup 변경 0건.
          */}
          <div
            className={styles.videoFrame}
            data-skeleton={hasVideo ? "false" : "true"}
            data-source={isYouTube ? "youtube" : hasVideo ? "mp4" : "none"}
          >
            {isYouTube ? (
              <iframe
                key={activeEpisode?.id ?? activeCategory.id}
                className={styles.video}
                src={youTubeSrc}
                title={activeEpisode?.title ?? "데모 영상"}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <video
                key={activeEpisode?.id ?? activeCategory.id}
                className={styles.video}
                controls
                playsInline
                preload={preload}
                autoPlay={false}
                {...(hasVideo ? { src: activeVideoUrl } : {})}
              />
            )}
            {!hasVideo ? (
              <div className={styles.skeleton} aria-hidden="true">
                <div className={styles.skeletonGrain} />
                <p className={styles.skeletonCopy}>영상 준비 중</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* 우측: episode 리스트 */}
        <ul
          className={styles.episodeList}
          role="listbox"
          aria-label={`${activeCategory.labelKo} 에피소드`}
        >
          {activeCategory.episodes.map((ep) => {
            const isSelected = ep.id === activeEpisodeId;
            return (
              <li key={ep.id} className={styles.episodeItem}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-episode-id={ep.id}
                  className={`${styles.episodeButton} ${
                    isSelected ? styles.episodeButtonActive : ""
                  }`}
                  onClick={() => onSelectEpisode(activeCategory.id, ep.id)}
                >
                  <span className={styles.episodeTitle}>{ep.title}</span>
                  {!ep.videoUrl ? (
                    <span className={styles.episodeBadge}>준비 중</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
