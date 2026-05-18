"use client";

// Designer project gallery — grid of 9 cards + a modal carousel.
// Originally a single 300-line vanilla JS block in designer/index.html;
// here split into typed state + keyboard handlers + body scroll lock.

import { useCallback, useEffect, useState } from "react";
import { PROJECTS, type Project } from "./projects";
import styles from "./ProjectGallery.module.css";
import pageStyles from "./page.module.css";

export function ProjectGallery() {
  // -1 = closed; otherwise the active project's index in PROJECTS.
  const [projectIdx, setProjectIdx] = useState<number>(-1);
  const [slide, setSlide] = useState<number>(0);

  const isOpen = projectIdx >= 0;
  const project: Project | null = isOpen ? PROJECTS[projectIdx] : null;

  const open = (i: number) => {
    setProjectIdx(i);
    setSlide(0);
  };
  const close = useCallback(() => setProjectIdx(-1), []);

  const nextProject = useCallback(() => {
    setProjectIdx((i) => (i + 1) % PROJECTS.length);
    setSlide(0);
  }, []);
  const prevProject = useCallback(() => {
    setProjectIdx((i) => (i - 1 + PROJECTS.length) % PROJECTS.length);
    setSlide(0);
  }, []);

  const nextSlide = useCallback(() => {
    if (!project) return;
    setSlide((s) => (s + 1) % project.images.length);
  }, [project]);
  const prevSlide = useCallback(() => {
    if (!project) return;
    setSlide((s) => (s - 1 + project.images.length) % project.images.length);
  }, [project]);

  // Body-scroll lock + keyboard nav while modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") { e.preventDefault(); prevSlide(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); nextSlide(); }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, nextSlide, prevSlide]);

  return (
    <>
      <div className={pageStyles.workGrid}>
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={pageStyles.workCard}
            onClick={() => open(i)}
            aria-label={`Open ${p.title} project`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail} alt={p.title} loading="lazy" />
            <div className={pageStyles.cardInfo}>
              <div className={pageStyles.ciNum}>{p.num}</div>
              <div className={pageStyles.ciTitle}>{p.title}</div>
              <div className={pageStyles.ciDesc}>{p.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal — rendered into the same React tree (no portal needed; the
          fixed overlay covers the viewport regardless of DOM position). */}
      {project && (
        <div
          className={`${styles.overlay} ${styles.open}`}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className={styles.modal}>
            <header className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.mhNum}>{project.num}</div>
                <div id="modal-title" className={styles.mhTitle}>{project.title}</div>
                <div className={styles.mhSubtitle}>{project.subtitle}</div>
                <div className={styles.mhMeta}>
                  {project.meta.map((m) => (
                    <div key={m.label} className={styles.mhMetaItem}>
                      <div className={styles.mmLabel}>{m.label}</div>
                      <div className={styles.mmValue}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.nav}>
                <button onClick={prevProject} title="Previous project" aria-label="Previous project">←</button>
                <span className={styles.counter}>
                  {projectIdx + 1} / {PROJECTS.length}
                </span>
                <button onClick={nextProject} title="Next project" aria-label="Next project">→</button>
              </div>
              <button className={styles.close} onClick={close} aria-label="Close">×</button>
            </header>

            <div className={styles.bodyScroll}>
              {/* Tag & link bar */}
              <div className={styles.topBar}>
                {project.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
                {project.links.length > 0 && (
                  <span style={{ marginLeft: "auto", display: "inline-flex", gap: "0.4rem" }}>
                    {project.links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkBtn}
                      >
                        {l.label} →
                      </a>
                    ))}
                  </span>
                )}
              </div>

              {/* Carousel */}
              <div className={styles.carousel}>
                <div
                  className={styles.track}
                  style={{ transform: `translateX(-${slide * 100}%)` }}
                >
                  {project.images.map((img) => (
                    <div key={img} className={styles.slide}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={project.title} />
                    </div>
                  ))}
                </div>
                {project.images.length > 1 && (
                  <>
                    <button
                      className={`${styles.arrow} ${styles.arrowPrev}`}
                      onClick={prevSlide}
                      aria-label="Previous image"
                    >‹</button>
                    <button
                      className={`${styles.arrow} ${styles.arrowNext}`}
                      onClick={nextSlide}
                      aria-label="Next image"
                    >›</button>
                  </>
                )}
                <div className={styles.dots}>
                  {project.images.map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`}
                      onClick={() => setSlide(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className={styles.desc}>
                {project.desc.map((d) => (
                  <div key={d.title} className={styles.descSection}>
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
