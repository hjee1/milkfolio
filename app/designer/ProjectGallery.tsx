"use client";

// Designer project index — one editorial "frame" per project (large
// grayscale image + info beside). Clicking a frame opens a full-screen
// white, box-less detail view that flows like the rest of the page.

import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "./projects";
import styles from "./ProjectGallery.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectGallery() {
  // -1 = closed; otherwise the active project's index in PROJECTS.
  const [projectIdx, setProjectIdx] = useState<number>(-1);

  const overlayRef = useRef<HTMLDivElement>(null);

  const isOpen = projectIdx >= 0;
  const project: Project | null = isOpen ? PROJECTS[projectIdx] : null;

  // Reset scroll to the top whenever the active project changes.
  useEffect(() => {
    if (isOpen) overlayRef.current?.scrollTo({ top: 0 });
  }, [projectIdx, isOpen]);

  const open = (i: number) => setProjectIdx(i);
  const close = useCallback(() => setProjectIdx(-1), []);
  const nextProject = useCallback(
    () => setProjectIdx((i) => (i + 1) % PROJECTS.length),
    [],
  );
  const prevProject = useCallback(
    () => setProjectIdx((i) => (i - 1 + PROJECTS.length) % PROJECTS.length),
    [],
  );

  // Body-scroll lock + keyboard nav while the detail view is open.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") { e.preventDefault(); prevProject(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); nextProject(); }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, nextProject, prevProject]);

  return (
    <>
      {/* ── Project index: one frame per project ─────────────── */}
      <div className={styles.list}>
        {PROJECTS.map((p, i) => (
          <article
            key={p.id}
            className={`${styles.row} ${i % 2 === 1 ? styles.reverse : ""}`}
          >
            <button
              type="button"
              className={styles.media}
              onClick={() => open(i)}
              aria-label={`Open ${p.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbnail} alt={p.title} loading="lazy" />
            </button>

            <div className={styles.info}>
              <div className={styles.num}>№ {p.num}</div>
              <div className={styles.numRule} aria-hidden />
              <h3 className={styles.rowTitle}>{p.title}</h3>
              <p className={styles.rowSubtitle}>{p.subtitle}</p>
              <div className={styles.metaGrid}>
                {p.meta.map((m) => (
                  <div key={m.label} className={styles.metaItem}>
                    <span className={styles.metaLabel}>{m.label}</span>
                    <span className={styles.metaVal}>{m.value}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={styles.openHint}
                onClick={() => open(i)}
              >
                View project →
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* ── Detail view — full-screen white, no box ──────────── */}
      {project && (
        <div
          ref={overlayRef}
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-title"
        >
          <div className={styles.bar}>
            <div className={styles.barInner}>
              <span className={styles.counter}>
                {pad(projectIdx + 1)} / {pad(PROJECTS.length)}
              </span>
              <div className={styles.barNav}>
                <button type="button" onClick={prevProject} aria-label="Previous project">
                  ← Prev
                </button>
                <button type="button" onClick={nextProject} aria-label="Next project">
                  Next →
                </button>
                <button
                  type="button"
                  className={styles.close}
                  onClick={close}
                  aria-label="Close"
                >
                  Close ✕
                </button>
              </div>
            </div>
          </div>

          <article className={styles.detail}>
            <header className={styles.detailHead}>
              <div className={styles.detailNum}>№ {project.num}</div>
              <h2 id="detail-title" className={styles.detailTitle}>{project.title}</h2>
              <p className={styles.detailSubtitle}>{project.subtitle}</p>
            </header>

            <div className={styles.detailMeta}>
              {project.meta.map((m) => (
                <div key={m.label} className={styles.metaItem}>
                  <span className={styles.metaLabel}>{m.label}</span>
                  <span className={styles.metaVal}>{m.value}</span>
                </div>
              ))}
            </div>

            {project.tags.length > 0 && (
              <div className={styles.tags}>
                {project.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            )}

            <div className={styles.gallery}>
              {project.images.map((img) => (
                <div key={img} className={styles.shot}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={project.title} loading="lazy" />
                </div>
              ))}
            </div>

            <div className={styles.detailDesc}>
              {project.desc.map((d) => (
                <div key={d.title} className={styles.descBlock}>
                  <h3 className={styles.descTitle}>{d.title}</h3>
                  <p className={styles.descText}>{d.text}</p>
                </div>
              ))}
            </div>

            {project.links.length > 0 && (
              <div className={styles.links}>
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
              </div>
            )}
          </article>
        </div>
      )}
    </>
  );
}
