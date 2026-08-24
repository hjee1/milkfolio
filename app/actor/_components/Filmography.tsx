import { FILMOGRAPHY } from "../data";
import styles from "./Filmography.module.css";

/**
 * /actor Filmography — 매거진 인덱스 타이포 (Server Component).
 *
 * 6작품(§6 D5)을 카테고리별(드라마/영화/뮤지컬)로 그룹화하여 표시.
 * 캐릭터명·역할 타입·플랫폼이 정정된 후 표기를 따른다 (data.ts FILMOGRAPHY
 * 참조). 매장직원→점원, 무명→대현/집주인 등.
 *
 * 매거진 톤:
 *   - 섹션 헤더: eyebrow (gold-on-light) + Cormorant H2 "필모그래피"
 *   - 카테고리 라벨: small caps Cormorant + hairline rule (gold)
 *   - 엔트리 행: 연도(serif 작게) | 작품명(Cormorant italic 중형) |
 *     플랫폼 chip (있을 때만) | roleType (gold-on-light, 작은 pill) |
 *     캐릭터명 (Pretendard muted)
 *   - hover: 매거진 톤 유지를 위해 매우 미세하게 (행 배경 미세 darken)
 *
 * Netflix 빨간 배지는 사용하지 않는다 (이전 noir 톤). gold 액센트 패턴으로
 * 통일 (REQ-ACT-U-011 zone c).
 *
 * 각 엔트리 행에 `data-filmo-entry` 속성을 부착하여 E2E가 정확히 6개의
 * 작품이 표시되는지 검증할 수 있도록 한다 (REQ-ACT-U-006 / acceptance H1).
 *
 * @MX:NOTE: [AUTO] Filmography 섹션은 SSR-only. 클라이언트 JS 0.
 *           data-filmo-entry는 E2E count 검증을 위한 마커이며 시각 영향
 *           없다. data.ts FILMOGRAPHY @MX:ANCHOR가 6작품 set을 보호한다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001, REQ-ACT-U-002,
 *           REQ-ACT-U-005, REQ-ACT-U-006, REQ-ACT-U-011, REQ-ACT-N-005,
 *           REQ-ACT-N-008
 */
export function Filmography() {
  return (
    <section
      id="filmography"
      className={styles.root}
      aria-labelledby="filmography-heading"
    >
      <div className={styles.container} data-reveal>
        <header className={styles.head}>
          <p className={styles.eyebrow}>Filmography</p>
          <h2 id="filmography-heading" className={styles.title}>
            필모그래피
          </h2>
        </header>

        <div className={styles.blocks}>
          {FILMOGRAPHY.map((block) => (
            <section
              key={block.category}
              className={styles.block}
              aria-label={block.category}
            >
              <div className={styles.categoryRow}>
                <h3 className={styles.categoryLabel}>{block.category}</h3>
                <span className={styles.categoryRule} aria-hidden="true" />
              </div>

              <ul className={styles.entries}>
                {block.items.map((item) => (
                  <li
                    key={`${block.category}-${item.year}-${item.title}`}
                    className={styles.entry}
                    data-filmo-entry
                  >
                    <span className={styles.year}>{item.year}</span>

                    <div className={styles.entryBody}>
                      <div className={styles.entryTop}>
                        <span className={styles.titleText}>
                          <em>{item.title}</em>
                        </span>
                        {item.platform ? (
                          <span className={styles.platform}>
                            {item.platform}
                          </span>
                        ) : null}
                      </div>

                      <div className={styles.entryBottom}>
                        <span className={styles.roleType}>{item.roleType}</span>
                        <span className={styles.roleSeparator} aria-hidden="true">
                          ·
                        </span>
                        <span className={styles.roleName}>{item.roleName}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
