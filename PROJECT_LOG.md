# PROJECT_LOG — milkfolio
> Last updated: 2026-04-17
> This file is the source of truth for the milkfolio portfolio project.
> Future Claude sessions: read this first before touching anything.

---

## 1. What is milkfolio?

A personal multi-identity portfolio website hosted at **milkfolio.space**.
It houses three distinct profiles under one domain:

| # | Identity | URL | Status |
|---|----------|-----|--------|
| 01 | 서해우 — Actor | `milkfolio.space/actor/` | ✅ Live |
| 02 | Hyunwoo Jee (Terry) — Data Engineer | `milkfolio.space/dev/` | ✅ Live |
| 03 | Designer (user's sister) | `milkfolio.space/designer/` | 🔲 Coming Soon placeholder |

The root `milkfolio.space` is a **3-panel landing page** where visitors choose which profile to enter.

---

## 2. Owner / User Info

| Field | Value |
|-------|-------|
| Full name | Hyunwoo Jee (지현우) |
| Actor name | 서해우 (Seo Hae-woo) |
| English name | Terry |
| Born | 1994.04.18 |
| Height / Weight | 180cm / 60kg |
| Languages | Korean (native), Chinese (native), English (native), Japanese (intermediate) |
| Developer role | Data Engineer @ Hanwha System (~4 years) |
| Education | B.S. Computer Science, Illinois Institute of Technology (Chicago) |
| Dev stack | Apache Airflow, Databricks, Snowflake, Cognite CDF, Python, SQL, Spark |
| Work email | sawall@hanwha.com |
| Personal email | terryjhw@gmail.com |
| LinkedIn | linkedin.com/in/hyunwoo-jee-79b981189 |
| Instagram (acting) | @oceanmeetrain |
| GitHub | github.com/hjee1 |

---

## 3. Infrastructure

### Domain
- **Registrar:** Namecheap
- **Domain:** `milkfolio.space`
- **DNS configured:** A records → GitHub Pages IPs, CNAME `www` → `hjee1.github.io`

### GitHub Pages
- **Repo:** `https://github.com/hjee1/milkfolio` (public)
- **Branch:** `main`, root `/`
- **Custom domain:** `milkfolio.space` (set in repo Settings → Pages)
- **HTTPS:** Enforce HTTPS enabled
- **CNAME file:** `/CNAME` in repo root contains `milkfolio.space`

### Old repo (actor-only, now deprecated for the domain)
- `https://github.com/hjee1/seo-haewoo-actor`
- Custom domain was removed from this repo when milkfolio took over
- Can be kept as archive or deleted later

---

## 4. Local Project Structure

```
/Users/hyunwoojee/milkfolio/
├── CNAME                      # milkfolio.space
├── PROJECT_LOG.md             # ← this file
├── index.html                 # 3-panel landing page
│
├── actor/
│   ├── index.html             # 서해우 actor profile (Korean)
│   ├── style.css
│   └── assets/
│       ├── photo_0.jpg        # Main profile photo (hero + about)
│       ├── photo_1.png        # Netflix 당신이 죽였다 scene
│       ├── photo_2.png        # Netflix 당신이 죽였다 scene
│       ├── photo_3.png        # Gallery photo
│       └── photo_4.png        # Gallery photo
│
├── dev/
│   ├── index.html             # Terry Jee developer profile (English)
│   └── style.css
│
└── designer/
    └── index.html             # Coming soon placeholder (sister)
```

Asset source: originally extracted from `/Users/hyunwoojee/acting_profile.pptx` (5 photos).

---

## 5. Design System

### Landing Page (`index.html`)
- **Style:** Dark cinematic, 3-panel vertical split, full viewport
- **Fonts:** Cormorant Garamond (logo/names) + Space Grotesk (UI)
- **Interaction:** Hover expands active panel (flex ratio shift), bottom line animates in, description fades up
- **Colors:**
  - Actor accent: `#b8a98a` (warm gold)
  - Dev accent: `#38d9ff` (cyan)
  - Designer accent: `#d4b8cc` (soft pink/lavender, muted — coming soon)
- **Mobile:** Panels stack vertically (flex-direction: column)

### Actor Site (`actor/`)
- **Language:** Korean (한국어)
- **Style:** Dark cinematic, serif, editorial
- **Fonts:** Noto Serif KR + Cormorant Garamond
- **Accent:** `#b8a98a` (warm gold)
- **Sections:** Nav → Hero (fullscreen photo) → 프로필 → 필모그래피 → 갤러리 → 연락처 → Footer
- **Nav:** Has `← milkfolio` home link added (left side)
- **Footer:** Has `← milkfolio` home link

### Developer Site (`dev/`)
- **Language:** English
- **Style:** Modern tech, glassmorphism cards, animated grid background
- **Fonts:** Space Grotesk (headings) + Inter (body) + Fira Code (mono/tags)
- **Accent:** `#38d9ff` (cyan), gradient to `#0ea5e9`
- **Background:** `#070b12` (very dark navy)
- **Sections:** Nav → Hero (animated grid bg, gradient name) → About → Tech Stack → Experience (timeline) → Contact → Footer
- **Special effects:**
  - Hero: CSS grid background with `gridShift` animation
  - Hero: radial glow behind content
  - Hero: gradient text on "Jee."
  - Stack cards: lift + border glow on hover
  - Timeline: glowing dot for current role
  - Contact: full-width contact cards with arrow
- **Nav:** Has `← milkfolio` home link

### Designer Site (`designer/`)
- **Status:** Placeholder only — "Coming Soon"
- **Style:** Dark purple-tinted, minimal centered layout
- **Accent:** `#d4b8cc` (soft pink/lavender)
- **Content:** Badge, title "Designer", role "UI/UX · Product Design", back link

---

## 6. Actor Filmography (as of 2026-04-17)

| Year | Title | Category | Role | Note |
|------|-------|----------|------|------|
| 2025 | 당신이 죽였다 | Drama | 매장직원 | Netflix, 단역 |
| 2025 | 그래도 사랑이었다 | Film (short) | 국현 | 주연 |
| 2024 | 요즘것들 | Musical | 민혁 | 주연 |
| 2023 | 어느날 엄마가 봉투를 썼다 | Film (short) | 대현 | 주연 |
| 2023 | 단절 | Film (short) | 민준 | 주연 |
| 2023 | 사랑하거나 말거나 | Film (short) | 박우진 | 주연 |
| 2023 | 눈 | Film (short) | 집주인 | 주연 |

---

## 7. Git Workflow Rules
- **Always commit + push after every meaningful change.** Never batch without saving.
- Commit messages: imperative style (e.g., "Add gallery section")
- Remote: `https://github.com/hjee1/milkfolio` (branch: `main`)

---

## 8. Pending / TODO

### Designer profile (03)
- [ ] User will share sister's portfolio PDF
- [ ] Build full UI/UX designer profile from the PDF content
- [ ] Sister's info: unknown yet — to be filled in during next session
- [ ] Design direction: soft pink/lavender palette already established in landing; match that

### Actor site additions (discussed but not done)
- [ ] Showreel video embed (when available)
- [ ] Phone number (if user wants to add)
- [ ] PDF download of profile/CV

### General
- [ ] Add favicon to all pages
- [ ] Consider Open Graph meta tags for social sharing previews
- [ ] Consider adding a back-to-top button on long pages

---

## 9. Session History

### Session 1 — 2026.04.17 (acting-profile repo)
- Collected personal info from user
- Extracted text + 5 photos from `/Users/hyunwoojee/acting_profile.pptx`
- Built actor-only site in `/Users/hyunwoojee/acting-profile/`
- Pushed to `github.com/hjee1/seo-haewoo-actor`

### Session 2 — 2026.04.17 (milkfolio repo — this session)
- User bought `milkfolio.space` on Namecheap
- Explained DNS in plain language; guided user through Namecheap Advanced DNS setup
- Set up GitHub Pages on `seo-haewoo-actor` first, then migrated to `milkfolio` repo
- Installed Claude Code CLI update: `brew upgrade claude-code` (2.1.92 → 2.1.98)
- Discussed Claude Desktop ↔ Claude Code MCP integration (user was confused about "Claude Cowork")
- Built new `milkfolio` project structure:
  - Landing page (3-panel: Actor / Developer / Designer)
  - Actor site (moved from old repo, added home nav links)
  - Developer profile (creative, modern, full sections)
  - Designer placeholder (coming soon)
- Created GitHub repo `hjee1/milkfolio` and pushed everything
- Next step: user needs to (1) remove domain from old repo, (2) enable Pages + set domain on new repo

---

## 10. Key Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| Single repo for all 3 profiles | Simpler DNS, one GitHub Pages config, easier to manage |
| Domain: `milkfolio.space` | User wanted cheap, creative, non-name domain; `.space` TLD is affordable |
| Separate CSS per profile | Each identity has distinct style; sharing CSS would cause conflicts |
| Korean for actor site, English for dev site | Natural split — actor work is Korea-based, dev work is international |
| No JS frameworks | Static site on GitHub Pages; pure HTML/CSS is fast, zero dependencies |
| Designer: soft pink palette | Established in landing page accent; will carry into full designer build |

