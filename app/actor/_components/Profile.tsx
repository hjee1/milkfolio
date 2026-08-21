import Image from "next/image";
import { PROFILE } from "../data";
import styles from "./Profile.module.css";

/**
 * /actor Profile — Editorial Magazine 매거진 그리드 (Server Component).
 *
 * Hero→Profile 전환 직후 첫 본문 섹션이다. 12-col grid:
 *   - 좌측 5-6col: 큰 portrait (3:4 aspect, 컬럼 폭 full-bleed)
 *   - 우측 6-7col: eyebrow + h2 영문명 + 한국어 부제 + profile 테이블
 *
 * 헤딩 위계 (LD1 결정 — Phase 0+1 인계):
 *   - Hero가 h1 단독 보유 (`S E O   H A E U`)
 *   - Profile은 h2 사용 (영문명을 Cormorant 중형으로 표시, Hero H1 중복 회피)
 *
 * 페르소나 분리 (REQ-ACT-N-004):
 *   - PROFILE.info에는 학력/본업/엔지니어/Terry 등 prohibited substring이
 *     포함되지 않는다 (data.ts에서 enforce).
 *   - 이메일 `seohaeu.actor@gmail.com`은 캐스팅 contact으로 사용. 이전
 *     terryjhw@... 매핑은 2026-05-26 제거됨 (페르소나 누출 위험 0 달성).
 *
 * 매거진 톤:
 *   - eyebrow는 gold-on-light (#7c6240, ACTOR_TOKENS.accentGold) small caps
 *   - h2는 Cormorant Italic 중형 (Hero H1보다 작게)
 *   - profile 테이블은 hairline border (#d4ccbe) + 넉넉한 padding
 *
 * @MX:NOTE: [AUTO] Profile 섹션은 SSR-only. 클라이언트 JS 0. portrait img는
 *           above-the-fold이므로 loading="eager"로 LCP를 안정화한다.
 * @MX:SPEC: SPEC-ACTOR-REDESIGN-001 REQ-ACT-U-001, REQ-ACT-U-002,
 *           REQ-ACT-U-003, REQ-ACT-U-004, REQ-ACT-U-005, REQ-ACT-U-011,
 *           REQ-ACT-N-004
 */
export function Profile() {
  return (
    <section
      id="profile"
      className={styles.root}
      aria-labelledby="profile-heading"
    >
      <div className={styles.grid}>
        {/* 좌측: portrait — 3:4, grayscale 약간만, 매거진 톤 */}
        <div className={styles.portraitCol}>
          {/* profile.jpg 실측 1200×900 (가로) — CSS aspect-ratio 3/4가 crop을
              담당하므로 intrinsic 값은 실제 파일 치수를 따른다. Hero(100vh)
              아래 섹션이라 lazy가 기본값으로 올바르다. */}
          <Image
            src={PROFILE.portrait}
            alt={`${PROFILE.name} 프로필 사진`}
            className={styles.portrait}
            width={1200}
            height={900}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>

        {/* 우측: eyebrow + h2 + 한국어 부제 + profile 테이블 */}
        <div className={styles.contentCol}>
          <p className={styles.eyebrow}>Profile</p>

          <h2 id="profile-heading" className={styles.nameEn}>
            <em>{PROFILE.nameEn}</em>
          </h2>

          <p className={styles.nameKo}>{PROFILE.name}</p>

          <hr className={styles.rule} aria-hidden="true" />

          <table className={styles.infoTable}>
            <caption className={styles.tableCaption}>프로필 정보</caption>
            <tbody>
              {PROFILE.info.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className={styles.infoLabel}>
                    {row.label}
                  </th>
                  <td className={styles.infoValue}>
                    {row.href ? (
                      <a className={styles.infoLink} href={row.href}>
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
