import { PHOTO_CONCEPTS } from "../data";
import { ConceptCarousel } from "./ConceptCarousel";
import styles from "./PhotoConcepts.module.css";

/**
 * /actor PhotoConcepts — 사진 컨셉 섹션 (Server Component parent).
 *
 * Profile 바로 다음에 위치한다. 역할별 톤(직장인 / 다정한)을 카드 2장으로
 * 보여주며, 다중 이미지 컨셉은 ConceptCarousel(Client)이 화살표 + dot
 * indicator + auto-rotate를 처리한다.
 *
 * 헤딩 위계 (Phase 0+1 LD1):
 *   - Hero가 h1 단독 보유
 *   - PhotoConcepts 섹션은 h2 (`사진 컨셉`)
 *   - 각 컨셉 카드는 h3 (한국어 라벨)
 *
 * 매거진 톤 (다른 섹션과 동일 토큰):
 *   - off-white #f8f5f0 위
 *   - eyebrow: gold-on-light #7c6240 small caps (REQ-ACT-U-011)
 *   - h2: Cormorant 중형 (Profile / Reel / Roles와 같은 스케일)
 *   - 카드 라벨: Cormorant small caps + 한국어 부제
 *   - 카드 portrait aspect 4:5 통일 → 2-col 그리드에서 시각적 균형
 *
 * 페르소나 분리 (REQ-ACT-N-004): 본 컴포넌트의 정적 헤드라인과 PHOTO_CONCEPTS
 * 데이터에는 prohibited substring 0건.
 *
 * @MX:NOTE: [AUTO] SSR header + 카드 외곽만 서버에서 마크업, 인터랙션은
 *           ConceptCarousel(Client)에 격리.
 */
export function PhotoConcepts() {
  return (
    <section
      id="concepts"
      className={styles.root}
      aria-labelledby="concepts-heading"
    >
      <div className={styles.container} data-reveal>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Concept</p>
          <h2 id="concepts-heading" className={styles.title}>
            사진 컨셉
          </h2>
          <p className={styles.lead}>
            역할별로 어떤 톤이 어울리는지 한눈에 보여드립니다.
          </p>
        </header>

        <div className={styles.grid}>
          {PHOTO_CONCEPTS.map((concept) => (
            <article
              key={concept.id}
              className={styles.card}
              aria-labelledby={`concept-${concept.id}-heading`}
            >
              <div className={styles.cardMedia}>
                <ConceptCarousel
                  conceptId={concept.id}
                  images={concept.images}
                  altBase={concept.altBase}
                />
              </div>

              <div className={styles.cardCaption}>
                <p className={styles.cardLabelEn}>{concept.labelEn}</p>
                <h3
                  id={`concept-${concept.id}-heading`}
                  className={styles.cardLabelKo}
                >
                  {concept.labelKo}
                </h3>
                {concept.images.length > 1 ? (
                  <p className={styles.cardCount} aria-hidden="true">
                    {concept.images.length}장
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
