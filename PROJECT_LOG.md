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
    ├── index.html             # Yuna Jee designer portfolio (English)
    ├── style.css              # Designer-specific styles
    └── assets/
        ├── prism_robot.jpg    # PRISM surgical robot 3D render
        ├── prism_arms.jpg     # PRISM robot arm close-up
        ├── prism_exhibit.jpg  # PRISM at RoboWorld exhibition
        ├── unmute_device.jpg  # Unmute sound device render
        ├── unmute_concept.jpg # Unmute consumer/producer concept
        ├── unmute_texture.jpg # Chrome liquid texture study
        ├── pathguard_proto.jpg# PathGuard LED prototype
        ├── linkids_poster.jpg # Linkids brand poster
        ├── linkids_card.jpg   # Linkids business card mockup
        ├── linkids_notebook.jpg # Linkids branded notebook
        ├── archive_flowers.jpg# AI-generated floral composition
        └── archive_field.jpg  # AI-generated landscape
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
- **Owner:** Yuna Jee (지유나), Hyunwoo's sister
- **Language:** English
- **Style:** Dark editorial, thoughtful, modern — soft pink/lavender palette
- **Fonts:** Cormorant Garamond (headings) + Inter (body) + Space Grotesk (UI)
- **Accent:** `#d4b8cc` (soft pink/lavender), secondary `#b8a0c8`
- **Background:** `#0a080c` (near-black with purple tint)
- **Sections:** Nav → Hero (tagline + 4 featured cards) → 9 Case Studies → About (bio, skills, awards) → Archive (6 visual explorations) → Contact → Footer
- **Content source:** 84-page PDF portfolio ("for online portfolio_Yuna Jee.pdf")
- **Projects:** PRISM (surgery robot), Unmute (sound platform), XPense (game spending), PathGuard (evacuation), INSTIP (deaf wearable), -ENG (English rhythm), KUPID (portal redesign), memmo (film screening), Linkids (children's brand)
- **Awards:** Daejeon Design Award (INSTIP), Easy Lab Makerthon Excellence Award (PathGuard)
- **School:** Korea University, Industrial Design
- **Nav:** Has `← milkfolio` home link

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
- [x] User shared sister's portfolio PDF (84 pages, 110MB)
- [x] Built full designer portfolio from PDF content (9 case studies)
- [x] Updated landing page panel from "Coming Soon" to live link
- [ ] Contact info: email placeholder (yunajee.design@gmail.com) — confirm with Yuna
- [ ] Consider hosting portfolio PDF externally (110MB too large for GitHub Pages)
- [ ] Yuna may want to add LinkedIn or other social links

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

### Session 3 — 2026.04.26 (designer portfolio build)
- User provided sister Yuna Jee's portfolio PDF (84 pages, 110MB)
- Extracted text content via `pdftotext` and images via `pdfimages`
- Identified 9 projects with detailed case study content
- Converted and compressed key images (PPM → JPEG, resized for web)
- Built full designer portfolio site:
  - Hero with tagline and 4 featured project cards
  - 9 detailed case studies (PRISM, Unmute, XPense, PathGuard, INSTIP, -ENG, KUPID, memmo, Linkids)
  - About section with bio, skills, tools, awards, education
  - Archive section with visual explorations
  - Contact section
- Updated landing page: designer panel from "Coming Soon" placeholder to live link with Yuna Jee's name
- Pure HTML/CSS, no JS, matching the project's design rules

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

