# Apex Scale

**The organic growth engine for 8-figure brands.**

A conversion-focused site for *The Apex Multiplier Protocol™* — the system that turns two hours of monthly filming into 40 branded sub-accounts, 2,400 micro-films, and a contractual floor of 10M–500M organic views in twelve months.

---

## Run it

```bash
npm install      # once
npm start        # site + lead-capture API on http://localhost:3333
```

Open `index.html` directly for the front end alone; the forms need the Node server (or Vercel) to persist.

---

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The site: hero film, premise, protocol (+ live distribution simulator), arbitrage matrix, ROI model, **rate card**, proof vault, briefing, invitation, footer |
| `styles.css` | Design system — editorial luxury: ink & bone, champagne hairlines, one teal accent |
| `app.js` | Interaction layer: film sound toggle, counters, reveals, canvas simulator, ROI model, billing toggle, filters, FAQ, qualifier funnel, case modals, inline form |
| `legal.html` | Privacy policy, terms of engagement, security posture, performance guarantee (real pages, not `#` links) |
| `explainer.html` / `.css` / `.js` | The 90-second visual briefing (self-contained deck) |
| `assets/video/` | `hero-loop.mp4` (20s seamless loop with audio), `hero-loop-sm.mp4` (mobile), `hero-poster.jpg` |
| `assets/img/` | Editorial plates (foil, mic, marble, grid, thread, apex) + `og.jpg` social card |
| `assets/brand/` | `mark.svg` / `mark-micro.svg` (the brand mark as vector, inline-able), icon set, and the client's stationery + seal artifacts |
| `server.js` | Express: static site (correct caching/MIME) + `POST /api/leads` |
| `api/leads.js` · `api/health.js` | Vercel serverless equivalents |
| `schema.sql` | Neon Postgres `leads` table, indexes, view |
| `vercel.json` | Builds, routes, cache + security headers |

---

## Design direction

The previous build leaned on the standard "AI dark SaaS" look — neon glows, gradient text, glass cards, rounded pills, animated cursors. This build replaces it with an editorial system that reads like a private-capital firm rather than a growth-hacking template:

- **Palette** — Ink `#0a0908`, bone `#f2eee6`, champagne `#c9a96e`, one teal accent `#2ec4b6`. No blue-purple gradients.
- **Type** — Cormorant Garamond (display serif, real italics), Inter Tight (UI), DM Mono (labels, indices, prices).
- **Structure** — numbered sections, hairline rules, a magazine-style two-column section head, a light "paper" section for the rate card and proof so the page breathes.
- **Motion** — line-mask headline reveals, slow page-scroll fades, a single drifting film loop. Nothing bounces, nothing glows.
- **Brand mark** — `assets/brand/mark.svg` is the logomark traced from the client's own artwork into a 20-point SVG path. It ships inline so it inherits `currentColor` (gold by default, bone on hover) and stays sharp at every size. A `mark-micro.svg` cut drops the fine slot details for favicons and the 74px header, where they would otherwise mush. No raster logo is used anywhere in the UI.
- **Texture** — a fixed film-grain overlay (SVG turbulence) at low opacity to kill the flat digital look.

### The hero film

`apexmp4.mp4` (the source the client supplied) is a 10-second 1280×720 brand bumper with an audio bed. It's processed into:

- `assets/video/hero-loop.mp4` — 20 seconds, **ping-pong loop** (forward then reversed) so there is no visible cut, audio preserved, muted by default.
- `assets/video/hero-loop-sm.mp4` — 854px, no audio, served under 760px.
- `assets/video/hero-poster.jpg` — poster frame, preloaded, so the first paint is branded.

The hero frames the film to the right of the headline and layers a three-stop scrim so type stays legible over any frame of the loop. A **Film · sound off** control lets visitors opt into audio.

---

## Monetisation

The site is now built to sell, not just impress:

1. **A real rate card** — three tiers (Signal $4,800 · Multiplier $9,600 · Sovereign $24,000 / month), each with an explicit view floor, account count and monthly output. Monthly/annual toggle (−15%), an enterprise line for 250M–500M floors, plus what is *not* included.
2. **Tier-aware funnel** — "Request Signal/Multiplier/Sovereign" preloads that tier into the four-step qualifier and the matched-guarantee panel.
3. **Qualifier** — revenue → media readiness → objective → matched tier + lead form, with a progress hairline, keyboard trap, Esc/backdrop close, and reset on every open.
4. **Inline invitation form** — low-friction fallback for visitors who won't open a modal.
5. **Guarantee merchandising** — the SLA is stated in the hero, the ROI model, the FAQ, the rate card and a dedicated legal section.
6. **Scarcity that is honest** — "Q1 capacity: 3", framed as cohort limits rather than fake countdowns.
7. **Trust furniture** — real privacy/terms/security/guarantee pages, NDA-by-default, no newsletter capture, honeypot spam protection.
8. **Analytics ready** — Vercel Web Analytics kept; the API records `matched_tier`, plan and source for every lead so you can see which tier sells.

If you later want self-serve checkout, add a Stripe Checkout endpoint and point the tier buttons at it — the plan/price data is already on each button (`data-plan`, `data-plan-price`).

---

## CRM (Neon Postgres)

1. Create a project at [console.neon.tech](https://console.neon.tech) and copy the connection string.
2. `cp .env.example .env` and paste it into `DATABASE_URL`.
3. Run `schema.sql` in the Neon SQL Editor (or `psql "$DATABASE_URL" -f schema.sql`).
4. Restart `npm start`.

Without `DATABASE_URL` the API returns `202` (captured, logged locally) and the visitor still sees the thank-you state. Nothing breaks.

**Captured per lead:** name, email, phone, company, revenue tier, media readiness, objective, matched tier, timestamp, status.

---

## Deploy

- **Vercel** — import the repo; `vercel.json` handles static files, the serverless API, immutable asset caching, and security headers. Set `DATABASE_URL` in Project → Settings → Environment Variables.
- **Any Node host** — `npm start` (binds `0.0.0.0`, honours `PORT`).

---

## Checks run for this build

| Check | Result |
|-------|--------|
| DOM harness (jsdom) — 48 interaction assertions | ✅ 48/48, 0 runtime errors |
| HTML validation (`html-validate`, recommended ruleset) | ✅ clean (only the intentional muted-autoplay hint) |
| CSS parse (`css-tree`) | ✅ 0 errors |
| Class audit (HTML ↔ CSS) | ✅ no unstyled components |
| Every `<img>` has `alt`, one `<h1>`, unique ids, anchors resolve | ✅ |
| Local asset references all exist | ✅ |
| Server: pages, video, poster, icons, manifest, sitemap | ✅ all 200 with correct MIME |
| Video caching headers | ✅ immutable + byte-range |
| API: valid lead → 202/201, invalid → 400, redirects → 301 | ✅ |

---

## Notes / next steps

- Set `DATABASE_URL` to persist leads; add an email/SMS notification on insert.
- Wire the "Request" buttons to Cal.com/Calendly if you prefer self-booking to the qualifier.
- Client names, view figures and quotes were carried over from the previous build. Confirm each is a real, permissioned engagement before going public — the legal copy now frames them as documented case studies.
- Rates in the rate card are placeholders in the right order of magnitude; set your real numbers in `index.html` (`data-monthly` / `data-annual`) and in the `Service` JSON-LD block.

© 2026 Apex Scale Global Media Inc.
