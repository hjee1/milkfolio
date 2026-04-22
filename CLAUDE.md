# milkfolio

Multi-identity portfolio at **milkfolio.space** (GitHub Pages, public repo).
Three profiles under one domain: Actor (서해우), Data Engineer (Terry Jee), Designer (sister, coming soon).

## File Structure

```
index.html          — 3-panel landing page (hover-expand interaction)
actor/index.html    — 서해우 actor profile (Korean, serif editorial)
actor/style.css     — actor-specific styles
actor/assets/       — profile photos, Netflix stills, gallery images
dev/index.html      — Hyunwoo Jee developer profile (English, glassmorphism)
dev/style.css       — developer-specific styles
designer/index.html — placeholder "Coming Soon"
agent/index.html    — casting-agent dashboard gate (password-protected)
agent/data.html     — auto-generated dashboard data (DO NOT EDIT — pushed by casting-agent workflow)
CNAME               — milkfolio.space
```

## Infrastructure

- **Domain:** milkfolio.space (Namecheap, A records → GitHub Pages IPs, CNAME www → hjee1.github.io)
- **Hosting:** GitHub Pages on `hjee1/milkfolio` (main branch, root /)
- **HTTPS:** enforced
- **Old repo:** `hjee1/seo-haewoo-actor` (deprecated, domain removed)

## Design Rules

- Each profile has its own CSS — no shared stylesheet
- **Actor accent:** `#b8a98a` (warm gold) — Noto Serif KR + Cormorant Garamond
- **Dev accent:** `#38d9ff` (cyan) — Space Grotesk + Inter + Fira Code
- **Designer accent:** `#d4b8cc` (soft pink/lavender) — placeholder only
- Landing page: Cormorant Garamond (names) + Space Grotesk (UI)
- Actor site in Korean, dev site in English
- Pure HTML/CSS, no JS frameworks, zero dependencies

## agent/ Directory

- `agent/index.html` — password gate (SHA-256 client-side, sessionStorage)
- `agent/data.html` — auto-pushed by `hjee1/casting-agent` GitHub Actions workflow
- Password hash: `069d081...` (SHA-256 of actual password)
- Do NOT manually edit `data.html` — it gets overwritten on every casting-agent pipeline run

## Pending / TODO

- Designer profile: waiting for sister's portfolio PDF
- Actor site: showreel video embed, PDF profile download
- General: favicon, Open Graph meta tags, back-to-top button
