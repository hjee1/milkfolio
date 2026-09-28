/* Yuna Jee — portfolio interactions (vanilla JS, no dependencies) */
(() => {
  "use strict";

  const html = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const desktop = () => innerWidth > 820;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  /* ---------------- ticker ---------------- */
  const tickers = new Set();
  let vh = innerHeight;
  let lastY = scrollY;
  let velocity = 0;
  let scrollDir = 1;
  const frame = (t) => {
    const y = scrollY;
    const d = y - lastY;
    velocity = lerp(velocity, d, 0.2);
    if (Math.abs(d) > 0.5) scrollDir = d > 0 ? 1 : -1;
    lastY = y;
    tickers.forEach((fn) => fn(t, y));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  addEventListener("resize", () => { vh = innerHeight; }, { passive: true });

  /* ---------------- smooth wheel scroll ---------------- */
  const smooth = { on: fine && !reduce, target: scrollY, cur: scrollY, running: false, locked: false };
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const canScrollInside = (el) => {
    while (el && el !== body && el !== html) {
      const cs = getComputedStyle(el);
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1) return true;
      el = el.parentElement;
    }
    return false;
  };
  if (smooth.on) {
    html.classList.add("has-smooth");
    addEventListener("wheel", (e) => {
      if (e.ctrlKey || smooth.locked || canScrollInside(e.target)) return;
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16; else if (e.deltaMode === 2) dy *= innerHeight;
      if (!smooth.running) smooth.cur = smooth.target = scrollY;
      smooth.target = clamp(smooth.target + dy, 0, maxScroll());
      smooth.running = true;
    }, { passive: false });
    addEventListener("scroll", () => { if (!smooth.running) smooth.cur = smooth.target = scrollY; }, { passive: true });
    tickers.add(() => {
      if (!smooth.running) return;
      smooth.cur = lerp(smooth.cur, smooth.target, 0.11);
      if (Math.abs(smooth.target - smooth.cur) < 0.4) { smooth.cur = smooth.target; smooth.running = false; }
      window.scrollTo(0, smooth.cur);
    });
  }
  const scrollToY = (y) => {
    if (smooth.on) { smooth.cur = scrollY; smooth.target = clamp(y, 0, maxScroll()); smooth.running = true; }
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };
  const lockScroll = (on) => { smooth.locked = on; smooth.running = false; body.style.overflow = on ? "hidden" : ""; };

  /* ---------------- text splitting ---------------- */
  const splitNode = (root, mode) => {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((ch) => {
        if (ch.nodeType === 3) {
          const parts = ch.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            if (mode === "chars") {
              const w = document.createElement("span");
              w.style.whiteSpace = "nowrap";
              w.style.display = "inline-block";
              Array.from(p).forEach((c) => {
                const o = document.createElement("span"); o.className = "split-c";
                const n = document.createElement("span"); n.textContent = c; n.style.setProperty("--i", i++);
                o.appendChild(n); w.appendChild(o);
              });
              frag.appendChild(w);
            } else if (mode === "fill") {
              const s = document.createElement("span"); s.className = "fill-w"; s.textContent = p; frag.appendChild(s);
            } else {
              const o = document.createElement("span"); o.className = "split-w";
              const n = document.createElement("span"); n.textContent = p; n.style.setProperty("--i", i++);
              o.appendChild(n); frag.appendChild(o);
            }
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== "BR" && !ch.classList.contains("no-split")) {
          walk(ch);
        }
      });
    };
    walk(root);
    root.dataset.splitDone = "1";
    return i;
  };
  $$("[data-split]").forEach((el) => splitNode(el, el.dataset.split === "chars" ? "chars" : "words"));
  $$("[data-fill]").forEach((el) => splitNode(el, "fill"));

  /* ---------------- reveal on scroll ---------------- */
  let revealIO = null;
  const startReveals = () => {
    const targets = $$("[data-reveal], .reveal-media, [data-split]:not([data-split-manual])");
    if (reduce || !("IntersectionObserver" in window)) { targets.forEach((t) => t.classList.add("is-in")); return; }
    // clip-path hides an element from IntersectionObserver in some engines, so
    // clipped media are observed through their parent element.
    const proxy = new Map();
    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        (proxy.get(en.target) || [en.target]).forEach((t) => t.classList.add("is-in"));
        revealIO.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    targets.forEach((t) => {
      if (t.classList.contains("reveal-media") && t.parentElement) {
        const host = t.parentElement;
        if (!proxy.has(host)) proxy.set(host, []);
        proxy.get(host).push(t);
        revealIO.observe(host);
      } else revealIO.observe(t);
    });
  };

  /* ---------------- visibility helper ---------------- */
  const visible = new Set();
  const visIO = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => en.isIntersecting ? visible.add(en.target) : visible.delete(en.target));
  }, { rootMargin: "20% 0px 20% 0px" }) : null;
  const watch = (el) => { if (visIO) visIO.observe(el); else visible.add(el); };
  const progressOf = (el, start = 1, end = 0) => {
    // 0 when el top hits start*vh, 1 when el bottom hits end*vh
    const r = el.getBoundingClientRect();
    const a = vh * start - r.top;
    const total = r.height + vh * (start - end);
    return clamp(a / total);
  };

  /* ---------------- scroll-fill text ---------------- */
  $$("[data-fill]").forEach((el) => {
    const words = $$(".fill-w", el);
    watch(el);
    tickers.add(() => {
      if (!visible.has(el)) return;
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.3));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < n || reduce));
    });
  });

  /* ---------------- parallax ---------------- */
  if (!reduce) {
    $$("[data-parallax]").forEach((el) => {
      const s = parseFloat(el.dataset.parallax) || 0.1;
      const host = el.parentElement;
      watch(host);
      tickers.add(() => {
        if (!visible.has(host)) return;
        const r = host.getBoundingClientRect();
        const off = (r.top + r.height / 2 - vh / 2) * -s;
        el.style.translate = `0 ${off.toFixed(1)}px`;
      });
    });
  }

  /* ---------------- cursor ---------------- */
  if (fine) {
    html.classList.add("has-cursor");
    const cur = document.createElement("div");
    cur.className = "cursor";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<div class="cursor__ball"><span class="cursor__label"></span></div>';
    body.appendChild(cur);
    const ball = $(".cursor__ball", cur);
    const label = $(".cursor__label", cur);
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; cur.classList.add("is-visible"); }, { passive: true });
    document.addEventListener("mouseleave", () => cur.classList.remove("is-visible"));
    addEventListener("mousedown", () => cur.classList.add("is-down"));
    addEventListener("mouseup", () => cur.classList.remove("is-down"));
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor], a, button, input[type=range], label");
      const hidden = e.target.closest("[data-cursor-hide], iframe, input[type=text], textarea");
      cur.classList.toggle("is-hidden", !!hidden);
      if (t && t.dataset.cursor) {
        label.textContent = t.dataset.cursor;
        cur.classList.add("has-label");
        cur.classList.remove("is-hover");
        cur.classList.toggle("is-accent", t.hasAttribute("data-cursor-accent"));
      } else if (t) {
        cur.classList.remove("has-label", "is-accent");
        cur.classList.add("is-hover");
      } else {
        cur.classList.remove("has-label", "is-hover", "is-accent");
      }
    });
    tickers.add(() => {
      cx = lerp(cx, mx, 0.2); cy = lerp(cy, my, 0.2);
      cur.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    });

    // magnetic buttons
    $$("[data-magnetic]").forEach((el) => {
      const k = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transition = "transform .2s ease-out";
        el.style.transform = `translate(${dx * k}px, ${dy * k * 1.2}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .7s cubic-bezier(.16,1,.3,1)";
        el.style.transform = "";
      });
    });
  }

  /* ---------------- header: dark detection + nav chip ---------------- */
  const header = $(".header");
  if (header) {
    const darkZones = $$("[data-header='dark']");
    const probe = () => {
      const y = 36;
      let dark = body.classList.contains("theme-dark") && !$$("[data-header='light']").some((z) => { const r = z.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
      if (!dark) dark = darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
      header.classList.toggle("on-dark", dark);
    };
    tickers.add(probe);

    const nav = $(".nav", header);
    if (nav) {
      const chip = document.createElement("span");
      chip.className = "nav__chip";
      nav.prepend(chip);
      const links = $$("a", nav);
      const current = links.find((a) => a.getAttribute("aria-current") === "page");
      const place = (a, instant) => {
        if (!a) { chip.style.width = "0px"; return; }
        if (instant) chip.style.transition = "none";
        chip.style.width = a.offsetWidth + "px";
        chip.style.transform = `translateX(${a.offsetLeft}px)`;
        if (instant) requestAnimationFrame(() => { chip.style.transition = ""; });
      };
      place(current, true);
      addEventListener("load", () => place(current, true));
      document.fonts && document.fonts.ready.then(() => place(current, true));
      links.forEach((a) => a.addEventListener("mouseenter", () => { nav.classList.add("is-hovering"); place(a); }));
      nav.addEventListener("mouseleave", () => { nav.classList.remove("is-hovering"); place(current); });
      addEventListener("resize", () => place(current, true));
    }
  }

  /* ---------------- mobile menu ---------------- */
  const burger = $(".burger");
  if (burger) {
    const setMenu = (open) => {
      html.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      lockScroll(open);
      const menu = $(".menu");
      if (menu) menu.setAttribute("aria-hidden", String(!open));
    };
    burger.addEventListener("click", () => setMenu(!html.classList.contains("menu-open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && html.classList.contains("menu-open")) setMenu(false); });
  }

  /* ---------------- page transitions ---------------- */
  const curtain = $(".curtain");
  const readyFns = [];
  const onReady = (fn) => readyFns.push(fn);
  let isReady = false;
  const fireReady = () => { if (isReady) return; isReady = true; readyFns.forEach((f) => f()); startReveals(); };

  const revealCurtain = () => {
    if (!curtain) return fireReady();
    curtain.classList.add("is-start");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.classList.remove("is-start");
      curtain.classList.add("is-revealing");
      setTimeout(fireReady, 250);
      setTimeout(() => curtain.classList.remove("is-revealing"), 1200);
    }));
  };

  if (curtain && !reduce) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /^(mailto|tel):/.test(a.getAttribute("href"))) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      if (html.classList.contains("menu-open")) { html.classList.remove("menu-open"); lockScroll(false); }
      curtain.classList.remove("is-revealing");
      curtain.classList.add("is-covering");
      store.set("yj-nav", "1");
      setTimeout(() => { location.href = url.href; }, 820);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { curtain.classList.remove("is-covering"); revealCurtain(); } });
  }

  /* ---------------- preloader ---------------- */
  const loader = $(".loader");
  const boot = () => {
    if (loader && !store.get("yj-seen") && !reduce) {
      store.set("yj-seen", "1");
      const digits = $$(".loader__digit > span", loader);
      const firstImg = $(".hero__slide img");
      let imgReady = false;
      if (firstImg) {
        const done = () => { imgReady = true; };
        if (firstImg.complete) done(); else { firstImg.addEventListener("load", done); firstImg.addEventListener("error", done); }
      } else imgReady = true;
      const t0 = performance.now();
      const minDur = 1900;
      const setCount = (n) => {
        const s = String(n).padStart(3, "0");
        digits.forEach((d, i) => { d.style.transform = `translateY(${-parseInt(s[i], 10) * 0.8}em)`; });
      };
      const step = (t) => {
        let p = clamp((t - t0) / minDur);
        if (!imgReady && t - t0 < 4000) p = Math.min(p, 0.9);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.round(eased * 100));
        if (p < 1) requestAnimationFrame(step);
        else {
          setTimeout(() => {
            loader.classList.add("is-done");
            setTimeout(fireReady, 350);
            setTimeout(() => loader.classList.add("is-gone"), 1400);
          }, 200);
        }
      };
      requestAnimationFrame(step);
    } else {
      if (loader) loader.classList.add("is-gone");
      if (store.get("yj-nav") && !reduce) { store.set("yj-nav", ""); revealCurtain(); }
      else fireReady();
    }
  };

  /* ---------------- hero slider ---------------- */
  const hero = $(".hero");
  if (hero) {
    const slides = $$(".hero__slide", hero);
    const tabs = $$(".hero__tab", hero);
    const DUR = 6500;
    let idx = -1, start = 0, paused = false, busy = false, inView = true;
    const go = (n) => {
      if (busy && idx !== -1) return;
      n = (n + slides.length) % slides.length;
      if (n === idx) return;
      busy = true;
      const prev = slides[idx];
      if (prev) {
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        setTimeout(() => prev.classList.remove("is-leaving"), 1000);
      }
      idx = n;
      setTimeout(() => {
        slides[idx].classList.add("is-active");
        busy = false;
      }, prev ? 350 : 0);
      tabs.forEach((t, i) => { t.classList.toggle("is-active", i === idx); t.style.setProperty("--p", i < idx ? 1 : 0); t.setAttribute("aria-selected", String(i === idx)); });
      slides.forEach((s, i) => s.setAttribute("aria-hidden", String(i !== idx)));
      start = performance.now();
    };
    tabs.forEach((t, i) => t.addEventListener("click", () => go(i)));
    const prevBtn = $("[data-hero-prev]", hero), nextBtn = $("[data-hero-next]", hero);
    prevBtn && prevBtn.addEventListener("click", () => go(idx - 1));
    nextBtn && nextBtn.addEventListener("click", () => go(idx + 1));
    addEventListener("keydown", (e) => {
      if (!inView || e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    });
    if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { inView = en.isIntersecting; }).observe(hero);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) start = performance.now() - (tabs[idx] ? parseFloat(tabs[idx].style.getPropertyValue("--p") || 0) * DUR : 0); });

    // drag
    let downX = null, downY = null, dragged = false;
    hero.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; downX = e.clientX; downY = e.clientY; dragged = false; paused = true; });
    addEventListener("pointermove", (e) => { if (downX !== null && Math.abs(e.clientX - downX) > 8) dragged = true; });
    addEventListener("pointerup", (e) => {
      if (downX === null) return;
      const dx = e.clientX - downX, dy = e.clientY - downY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(idx + (dx < 0 ? 1 : -1));
      downX = null; paused = false; start = performance.now() - (parseFloat(tabs[idx] && tabs[idx].style.getPropertyValue("--p")) || 0) * DUR;
    });
    hero.addEventListener("click", (e) => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
    hero.addEventListener("dragstart", (e) => e.preventDefault());

    tickers.add((t) => {
      if (idx < 0 || !tabs[idx]) return;
      if (paused || !inView || document.hidden || reduce) { start = t - (parseFloat(tabs[idx].style.getPropertyValue("--p")) || 0) * DUR; return; }
      const p = clamp((t - start) / DUR);
      tabs[idx].style.setProperty("--p", p.toFixed(4));
      if (p >= 1) go(idx + 1);
    });
    onReady(() => go(0));
  }

  /* ---------------- marquee ---------------- */
  $$("[data-marquee]").forEach((mq) => {
    const track = $(".marquee__track", mq);
    const base = parseFloat(mq.dataset.marquee) || 1;
    const item = track.firstElementChild;
    const fill = () => { while (track.scrollWidth < innerWidth * 2.2) track.appendChild(item.cloneNode(true)); };
    fill();
    $$(".marquee__item", track).forEach((n, i) => { if (i) n.setAttribute("aria-hidden", "true"); });
    let x = 0;
    watch(mq);
    tickers.add(() => {
      if (!visible.has(mq) || reduce) return;
      const w = item.offsetWidth;
      x -= (base + Math.abs(velocity) * 0.25) * scrollDir;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
  });

  /* ---------------- stepped columns ---------------- */
  $$(".steps").forEach((sec) => {
    const cols = $$("i", sec);
    const offs = [0.3, 0.05, 0.45, 0.15, 0.55, 0.25];
    watch(sec);
    tickers.add(() => {
      if (!visible.has(sec)) return;
      const p = reduce ? 1 : progressOf(sec, 1, 0.15);
      cols.forEach((c, i) => c.style.setProperty("--s", clamp((p - offs[i % offs.length] * 0.7) / 0.45).toFixed(3)));
    });
  });

  /* ---------------- counters ---------------- */
  const countIO = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target; countIO.unobserve(el);
      const to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || "0", 10), suf = el.dataset.suffix || "";
      if (reduce) { el.textContent = to.toFixed(dec) + suf; return; }
      const t0 = performance.now(), dur = 1600;
      const step = (t) => {
        const p = clamp((t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = (to * e).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 }) : null;
  $$("[data-count]").forEach((el) => { if (countIO) countIO.observe(el); else el.textContent = el.dataset.count; });

  /* ---------------- capabilities cylinder ---------------- */
  $$(".cyl").forEach((sec) => {
    const inner = $(".cyl__inner", sec);
    const items = $$(".cyl__item", sec);
    watch(sec);
    tickers.add(() => {
      if (!visible.has(sec) || !desktop()) return;
      const r = sec.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh));
      const h = items[0].offsetHeight;
      const f = p * (items.length - 1);
      inner.style.transform = `translate3d(0, ${(-f * h - h / 2).toFixed(1)}px, 0)`;
      const a = Math.round(f);
      items.forEach((it, i) => it.classList.toggle("is-active", i === a));
    });
  });

  /* ---------------- drifting words ---------------- */
  $$("[data-drift]").forEach((el) => {
    const dir = parseFloat(el.dataset.drift) || 1;
    const host = el.closest("section") || el.parentElement;
    watch(host);
    tickers.add(() => {
      if (!visible.has(host) || reduce) return;
      const p = progressOf(host, 1, 0.5);
      el.style.transform = `translate3d(${((1 - p) * dir * 22).toFixed(2)}vw,0,0)`;
    });
  });

  /* ---------------- clock ---------------- */
  const clocks = $$("[data-clock]");
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: true });
    const tick = () => clocks.forEach((c) => { c.textContent = fmt.format(new Date()).replace(" ", ""); });
    tick(); setInterval(tick, 10000);
  }

  /* ---------------- back to top / anchors ---------------- */
  $$("[data-totop]").forEach((b) => b.addEventListener("click", () => scrollToY(0)));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.getElementById(a.getAttribute("href").slice(1));
    if (!t) return;
    e.preventDefault();
    scrollToY(t.getBoundingClientRect().top + scrollY - 20);
  });

  /* ---------------- drag strips ---------------- */
  $$(".strip__view").forEach((view) => {
    const bar = $(".strip__progress i", view.parentElement);
    let down = false, sx = 0, sl = 0, v = 0, lastX = 0, moved = false;
    const update = () => {
      if (!bar) return;
      const w = view.clientWidth / view.scrollWidth;
      bar.style.width = (w * 100).toFixed(2) + "%";
      bar.style.left = ((view.scrollLeft / view.scrollWidth) * 100).toFixed(2) + "%";
    };
    view.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    view.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; sx = lastX = e.clientX; sl = view.scrollLeft; v = 0;
      view.classList.add("is-dragging");
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      view.scrollLeft = sl - dx;
      v = e.clientX - lastX; lastX = e.clientX;
    });
    addEventListener("pointerup", () => {
      if (!down) return;
      down = false; view.classList.remove("is-dragging");
      const glide = () => { if (Math.abs(v) < 0.4) return; view.scrollLeft -= v; v *= 0.93; requestAnimationFrame(glide); };
      if (!reduce) glide();
    });
    view.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    view.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { view.scrollBy({ left: 300, behavior: "smooth" }); e.preventDefault(); }
      if (e.key === "ArrowLeft") { view.scrollBy({ left: -300, behavior: "smooth" }); e.preventDefault(); }
    });
  });

  /* ---------------- compare slider ---------------- */
  $$(".compare").forEach((c) => {
    const input = $("input", c);
    const set = () => c.style.setProperty("--x", input.value + "%");
    input.addEventListener("input", set);
    set();
  });

  /* ---------------- pinned features ---------------- */
  $$(".pin").forEach((pin) => {
    const figs = $$(".pin__stage figure", pin);
    const items = $$(".pin__item", pin);
    const count = $(".pin__count", pin);
    const activate = (i) => {
      figs.forEach((f, k) => f.classList.toggle("is-active", k === i));
      items.forEach((it, k) => it.classList.toggle("is-active", k === i));
      if (count) count.textContent = String(i + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
    };
    activate(0);
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) activate(items.indexOf(en.target)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    items.forEach((it) => io.observe(it));
  });

  /* ---------------- archive: filters, preview, drawer ---------------- */
  const alist = $(".alist");
  if (alist) {
    const rows = $$("li", alist);
    const btns = $$("[data-filter]");
    btns.forEach((b) => b.addEventListener("click", () => {
      const f = b.dataset.filter;
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      rows.forEach((r) => r.classList.toggle("is-hidden", f !== "all" && !(r.dataset.cat || "").split(" ").includes(f)));
    }));

    const pv = $(".apreview");
    if (pv && fine) {
      const imgs = $$("img", pv);
      let px = 0, py = 0, tx = 0, ty = 0, rot = 0, on = false;
      addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
      rows.forEach((r, i) => {
        r.addEventListener("mouseenter", () => {
          on = true; pv.classList.add("is-on"); alist.classList.add("has-hover");
          imgs.forEach((im, k) => im.classList.toggle("is-active", k === i));
        });
        r.addEventListener("mouseleave", () => { on = false; pv.classList.remove("is-on"); alist.classList.remove("has-hover"); });
      });
      tickers.add(() => {
        if (!on && !pv.classList.contains("is-on")) { px = tx; py = ty; return; }
        const nx = lerp(px, tx, 0.14), ny = lerp(py, ty, 0.14);
        rot = lerp(rot, clamp((nx - px) * 0.6, -12, 12), 0.15);
        px = nx; py = ny;
        pv.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) rotate(${rot.toFixed(2)}deg) scale(${on ? 1 : 0.8})`;
      });
    }

    const dataEl = $("#archive-data");
    const drawer = $(".drawer");
    if (dataEl && drawer) {
      const data = JSON.parse(dataEl.textContent);
      const panel = $(".drawer__panel", drawer);
      const content = $(".drawer__content", drawer);
      let lastFocus = null;
      const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      const open = (id) => {
        const d = data[id]; if (!d) return;
        lastFocus = document.activeElement;
        content.innerHTML =
          `<p class="mono muted">${esc(d.num)} — Archive</p>` +
          `<h2 id="drawer-title">${esc(d.title)}</h2><p class="drawer__sub">${esc(d.subtitle)}</p>` +
          `<dl>${d.meta.map((m) => `<div><dt>${esc(m.label)}</dt><dd>${esc(m.value)}</dd></div>`).join("")}</dl>` +
          d.desc.map((s) => `<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>`).join("") +
          `<div class="tags">${d.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` +
          (d.links.length ? `<div class="links">${d.links.map((l) => `<a class="pill" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>` : "") +
          `<div class="drawer__imgs">${d.images.map((src, i) => `<img src="${esc(src)}" alt="${esc(d.title)} — ${i + 1}" loading="lazy" decoding="async" width="1600" height="1007">`).join("")}</div>`;
        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
        panel.scrollTop = 0;
        lockScroll(true);
        setTimeout(() => $(".drawer__close", drawer).focus(), 50);
      };
      const close = () => {
        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
        lockScroll(false);
        if (lastFocus) lastFocus.focus();
      };
      $$("[data-drawer]").forEach((b) => b.addEventListener("click", () => open(b.dataset.drawer)));
      $(".drawer__close", drawer).addEventListener("click", close);
      $(".drawer__scrim", drawer).addEventListener("click", close);
      addEventListener("keydown", (e) => {
        if (!drawer.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "Tab") {
          const f = $$("a[href], button", panel);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      });
    }
  }

  /* ---------------- copy to clipboard ---------------- */
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) { return; }
    const t = b.textContent; b.textContent = "Copied"; b.classList.add("is-done");
    setTimeout(() => { b.textContent = t; b.classList.remove("is-done"); }, 1800);
  }));

  /* ---------------- work hero intro ---------------- */
  const wh = $(".w-hero");
  if (wh) onReady(() => setTimeout(() => wh.classList.add("is-in"), 80));

  /* ---------------- go ---------------- */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
