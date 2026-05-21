import { REEL } from "../data";
import { ReelPlayer } from "./ReelPlayer";
import styles from "./Reel.module.css";

/**
 * /actor Reel — 데모 영상 섹션 (Server Component).
 *
 * 6 섹션 구조 중 3번째 섹션. Hero → Profile → Reel → … 순서. 본 컴포넌트는
 * 서버에서 헤드라인·eyebrow·lead 카피만 마크업하고, 탭/episode/skeleton 같은
 * 모든 인터랙션은 클라이언트 자식인 ReelPlayer에 격리한다 (REQ-ACT-U-005).
 *
 * 헤딩 위계 (Phase 0+1 LD1):
 *   - Hero가 h1 단독 보유
 *   - Reel 섹션 헤드라인은 h2 (`데모 영상`)
 *
 * 페르소나 분리 (REQ-ACT-N-004): 본 컴포넌트의 텍스트는 데이터 의존성이 없는
 * 정적 헤드라인 3줄(eyebrow 영문 "Reel" + h2 "데모 영상" + lead 한국어 1줄)로만
 * 구성되어 있다. prohibited substring(IIT / Hanwha / developer / engineer /
 * Terry / 지현우 …) 0건을 작성 시점에 확정한다.
 *
 * 매거진 톤:
 *   - eyebrow는 gold-on-light (`accentGold` #7c6240) small caps (REQ-ACT-U-011)
 *   - h2는 Cormorant 중형 (Profile / Filmography와 동일 스케일)
 *   - lead는 Pretendard, ink.soft, 1줄
 *
 * @MX:NOTE: [AUTO] Reel 섹션은 SSR 헤드라인 + ReelPlayer Client 인터랙션의
 *           분리 구조. 데이터는 ../data.ts의 REEL 카탈로그를 그대로 props로
 *           내려보낸다 (가공 0).
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001, REQ-ACT-U-002,
 *           REQ-ACT-U-005, REQ-ACT-U-011, REQ-ACT-U-012, REQ-ACT-N-004
 */
export function Reel() {
  return (
    <section
      id="reel"
      className={styles.root}
      aria-labelledby="reel-heading"
    >
      <div className={styles.container}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Reel</p>
          <h2 id="reel-heading" className={styles.title}>
            데모 영상
          </h2>
          <p className={styles.lead}>
            30초 안에 톤을 보여드리는 짧은 클립 모음입니다.
          </p>
        </header>

        <ReelPlayer categories={REEL} />
      </div>
    </section>
  );
}
