import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PROFILE, FILMOGRAPHY, GALLERY, NAV_LINKS } from "./data";
import styles from "./page.module.css";

// Server Component — no client JS needed. Pure markup, all data from data.ts.
export default function ActorPage() {
  return (
    <div className={styles.body}>
      <SiteNav brand={PROFILE.name} links={NAV_LINKS} />

      {/* HERO ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROFILE.hero} alt={PROFILE.name} className={styles.heroImg} />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroText}>
          <p className={styles.heroLabel}>{PROFILE.role}</p>
          <h1 className={styles.heroName}>{PROFILE.name}</h1>
          <p className={styles.heroNameEn}>{PROFILE.nameEn}</p>
        </div>
        <a href="#about" className={styles.scrollDown} aria-label="아래로 스크롤">
          <span />
        </a>
      </section>

      {/* ABOUT ────────────────────────────────────── */}
      <section className={styles.about} id="about">
        <div className={styles.container}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutPhotoCol}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PROFILE.about}
                alt={`${PROFILE.name} 프로필`}
                className={styles.aboutPhoto}
              />
            </div>
            <div className={styles.aboutInfoCol}>
              <h2 className={styles.sectionTitle}>프로필</h2>
              <table className={styles.infoTable}>
                <tbody>
                  {PROFILE.info.map((row) => (
                    <tr key={row.label}>
                      <th>{row.label}</th>
                      <td>
                        {row.href ? (
                          <a href={row.href}>{row.value}</a>
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
        </div>
      </section>

      {/* FILMOGRAPHY ──────────────────────────────── */}
      <section className={styles.filmography} id="filmography">
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} ${styles.center}`}>필모그래피</h2>
          {FILMOGRAPHY.map((block) => (
            <div key={block.category} className={styles.filmoBlock}>
              <h3 className={styles.filmoCategory}>{block.category}</h3>
              <div>
                {block.items.map((item, i) => (
                  <div key={`${block.category}-${i}`} className={styles.filmoItem}>
                    <span className={styles.filmoYear}>{item.year}</span>
                    <div>
                      <p className={styles.filmoTitle}>
                        {item.title}
                        {item.platform && (
                          <span className={styles.filmoPlatform}>{item.platform}</span>
                        )}
                        {item.typeTag && (
                          <span className={styles.filmoTypeTag}>{item.typeTag}</span>
                        )}
                      </p>
                      <p className={styles.filmoRole}>
                        {item.role}
                        {item.type && (
                          <span className={styles.filmoType}>{item.type}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY ──────────────────────────────────── */}
      <section className={styles.gallery} id="gallery">
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} ${styles.center}`}>갤러리</h2>
          <div className={styles.galleryGrid}>
            {GALLERY.map((item, i) => (
              <div
                key={i}
                className={`${styles.galleryItem} ${item.size ? styles[item.size] : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.alt} loading="lazy" />
                {item.caption && (
                  <div className={styles.galleryCaption}>{item.caption}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT ──────────────────────────────────── */}
      <section className={styles.contact} id="contact">
        <div className={`${styles.container} ${styles.contactInner}`}>
          <h2 className={`${styles.sectionTitle} ${styles.center}`}>연락처</h2>
          <p className={styles.contactSub}>
            캐스팅 및 작품 관련 문의는 아래로 연락 주세요.
          </p>
          <div className={styles.contactLinks}>
            <a href="mailto:terryjhw@gmail.com" className={styles.contactLink}>
              <span className={styles.contactIcon}>✉</span>
              terryjhw@gmail.com
            </a>
            <a
              href="https://www.instagram.com/oceanmeetrain"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              <span className={styles.contactIcon}>📷</span>
              @oceanmeetrain
            </a>
          </div>
        </div>
      </section>

      <SiteFooter copyright="© 2025 서해우. All rights reserved." />
    </div>
  );
}
