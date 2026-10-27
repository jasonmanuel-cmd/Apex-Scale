# Apex Scale

**The Organic Growth Engine for 8-Figure Brands.**

A high-converting marketing site for *The Apex Multiplier Protocol™* — a proprietary organic-growth system that turns 2 hours of monthly filming into 40 branded sub-accounts and 2,400+ micro-videos.

> Built as a redesign of the "sub-account strategy" agency model. Positioned as an elite, enterprise-grade alternative.

---

## Run it

```bash
npm install        # once
npm start          # serves the site + the lead-capture API
# open http://localhost:3333
```

You can also open `index.html` directly in a browser (the form and CRM need the Node server for persistence, but everything else works standalone).

---

## What's here

| File | Purpose |
|------|---------|
| `index.html` | Full page: hero, interactive protocol visualizer, arbitrage matrix, ROI calculator, proof vault, FAQ, 4-step lead funnel |
| `styles.css` | Dark-luxury design system (Onyx `#06080C`, gold `#D4AF37`, emerald `#10B981`) |
| `app.js` | Interactive engine: canvas node graph, ROI sliders, case-study filters, qualification modal, live toasts |
| `upscale.css` / `upscale.js` | **Luxury layer** — magnetic buttons, glowing gradient borders, animated counters, scroll reveals, cursor spotlight |
| `explainer.html` / `.css` / `.js` | **60-second animated explainer** of the whole protocol (self-contained, plays in the browser) |
| `server.js` | Express server: serves the site **and** exposes `POST /api/leads` (Neon CRM) |
| `schema.sql` | Neon Postgres schema (`leads` table + indexes + view) |
| `.env.example` | Template for your Neon connection string |

---

## CRM (Neon Postgres)

The lead form already POSTs to `/api/leads`. To persist leads to **Neon**:

1. Create a free project at [console.neon.tech](https://console.neon.tech) and copy its connection string.
2. `cp .env.example .env` and paste it into `DATABASE_URL`.
3. Run `schema.sql` in the Neon SQL Editor (or `psql "$DATABASE_URL" -f schema.sql`).
4. Restart `npm start`.

Without `DATABASE_URL`, the API still returns `202` (leads are logged locally, visitors see the normal thank-you) — nothing breaks.

**Captured per lead:** name, email, phone, company, revenue tier, media readiness, objective, matched guarantee tier, timestamp.

---

## Brand

- **Name:** Apex Scale
- **Slogan:** "The Organic Growth Engine for 8-Figure Brands."
- **Palette:** Onyx `#06080C` · Gold `#D4AF37` · Emerald `#10B981`
- **Core IP:** The Apex Multiplier Protocol™

© 2026 Apex Scale Global Media Inc.
