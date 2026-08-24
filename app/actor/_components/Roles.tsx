import { CHARACTER_CARDS } from "../data";
import { CharacterCard } from "./CharacterCard";
import { RoleTimeline } from "./RoleTimeline";
import styles from "./Roles.module.css";

/**
 * /actor Roles — 인물 중심 섹션 (Server Component parent).
 *
 * 6 섹션 구조 중 4번째. Hero → Profile → Reel → Roles → Filmography → Contact.
 * 본 컴포넌트는 서버에서 헤드라인·eyebrow·lead 카피와 RoleTimeline(Server)
 * 까지만 마크업하고, 6장의 CharacterCard(Client)에 인터랙션을 위임한다
 * (REQ-ACT-U-005).
 *
 * 헤딩 위계 (Phase 0+1 LD1):
 *   - Hero가 h1 단독 보유
 *   - Roles 섹션 헤드라인은 h2 (`역할`)
 *
 * 페르소나 분리 (REQ-ACT-N-004): 본 컴포넌트의 정적 헤드라인 3줄(eyebrow
 * 영문 "Roles" + h2 "역할" + lead 한국어 1줄)에 prohibited substring
 * 0건. CHARACTER_CARDS와 TIMELINE 데이터도 data.ts에서 동일 분리 원칙으로
 * 관리되어 본문에 prohibited substring 0건이 보장된다.
 *
 * 매거진 톤:
 *   - eyebrow는 gold-on-light (`accentGold` #7c6240) small caps (REQ-ACT-U-011)
 *   - h2는 Cormorant 중형 (Profile / Reel / Filmography와 동일 스케일)
 *   - lead는 Pretendard, ink.soft, 1줄
 *   - RoleTimeline horizontal strip 다음에 카드 grid 3-col(desktop) /
 *     2-col(tablet) / 1-col(mobile)
 *
 * @MX:NOTE: [AUTO] Server parent. CHARACTER_CARDS를 CharacterCard(Client)로
 *           위임. RoleTimeline은 그대로 Server. 데이터 가공 0.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001, REQ-ACT-U-002,
 *           REQ-ACT-U-005, REQ-ACT-U-006, REQ-ACT-U-011, REQ-ACT-N-004,
 *           REQ-ACT-N-008
 */
export function Roles() {
  return (
    <section
      id="roles"
      className={styles.root}
      aria-labelledby="roles-heading"
    >
      <div className={styles.container} data-reveal>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Roles</p>
          <h2 id="roles-heading" className={styles.title}>
            역할
          </h2>
          <p className={styles.lead}>
            연도별 작품과 인물의 단면을 함께 보여드립니다.
          </p>
        </header>

        <RoleTimeline />

        <div className={styles.grid}>
          {CHARACTER_CARDS.map((card) => (
            <CharacterCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
