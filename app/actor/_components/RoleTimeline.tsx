import { TIMELINE } from "../data";
import styles from "./RoleTimeline.module.css";

/**
 * /actor Roles — Horizontal Timeline (Server Component).
 *
 * 6개 작품(TIMELINE)을 연도 descending으로 시각화하는 매거진 인덱스.
 * 가장 최근 작품(2026)이 먼저 읽힌다. 데스크톱은 horizontal strip,
 * 모바일은 세로 stack으로 자연스럽게 wrap된다.
 *
 * 각 entry의 시각 구성 (매거진 톤):
 *   - 연도: Cormorant 작은 숫자 (4a4a4a, ink.soft)
 *   - 작품명: Cormorant italic 중형 (1a1a1a, ink.primary)
 *   - 역할 타입 + 캐릭터명: Pretendard small caps (gold-on-light zone c)
 *   - hairline 1px divider (rule: #d4ccbe) — 매거진 인덱스의 hairline 톤
 *
 * 헤딩 위계:
 *   - Hero가 h1 단독 보유
 *   - Roles 섹션은 부모(Roles.tsx)에서 h2 (`역할`)을 가진다
 *   - RoleTimeline 자체는 h3 또는 무명(부모 h2를 공유)을 사용
 *
 * E2E 마커:
 *   - data-role-timeline-entry / data-year — Phase 4 e2e가 6개 entry와
 *     첫 항목 year=2026 desc 정렬을 검증한다.
 *
 * @MX:NOTE: [AUTO] TIMELINE 6 entries 연도 desc 시각화. data.ts TIMELINE이
 *           단일 진실 공급원이며 본 컴포넌트는 데이터 가공 없이 렌더만 한다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001, REQ-ACT-U-005,
 *           REQ-ACT-U-006, REQ-ACT-U-011
 */
export function RoleTimeline() {
  return (
    <ol className={styles.timeline} aria-label="역할 타임라인">
      {TIMELINE.map((entry) => (
        <li
          key={`${entry.year}-${entry.workTitle}`}
          className={styles.entry}
          data-role-timeline-entry
          data-year={entry.year}
        >
          <div className={styles.yearRow}>
            <span className={styles.year}>{entry.year}</span>
            <span className={styles.rule} aria-hidden="true" />
          </div>
          <div className={styles.entryBody}>
            <p className={styles.workTitle}>
              <em>{entry.workTitle}</em>
            </p>
            <p className={styles.roleMeta}>
              <span className={styles.roleType}>{entry.roleType}</span>
              <span className={styles.roleSeparator} aria-hidden="true">
                ·
              </span>
              <span className={styles.roleName}>{entry.roleName}</span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
