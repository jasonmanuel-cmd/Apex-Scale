# Apex Scale — Project Record

Repo: `jasonmanuel-cmd/Apex-Scale` · Working branch: `arena/2b235b3d-apex-scale`
Last updated: 2026-10-27

---

## 1. Changes made & files affected

### Session C — editorial redesign, monetisation, hero film (this session)

**New art direction.** The old build was a textbook "AI dark SaaS" page: neon glow, gradient text, glass cards, rounded pills, cursor spotlight, ambient blobs, emoji icons, a live "someone just bought" toast. Replaced with an editorial, private-capital visual language.

- `styles.css` — **rewritten** (2,600 lines). Ink & bone palette, champagne hairlines, Cormorant Garamond + Inter Tight + DM Mono, numbered sections, paper (light) sections, hairline rules, film-grain overlay. No gradients-on-text, no shadows-instead-of-design.
- `index.html` — **rewritten**. New structure: hero film → premise → protocol (+ simulator) → mechanics → ROI model → **rate card** → ink band → proof → briefing → invitation → footer. Real `og:`/`twitter:` metadata, JSON-LD (Organization + Service + FAQPage), manifest, apple-touch-icon, skip link.
- `app.js` — **rewritten**. Film sound toggle, counters, reveals, canvas simulator (gold/teal, no party colours), ROI model, billing toggle, proof filters, FAQ accordion, 4-step qualifier with focus trap/inert/reset, case modals, inline invitation form, honeypot, fetch to `/api/leads`.
- `legal.html` — **new**. Privacy, terms of engagement, security & compliance, performance guarantee. Replaces four dead `#` links.
- `explainer.html/.css/.js` — restyled to the new system (serif deck, mono kickers, gold/teal swarm graph instead of platform brand colours).
- `site.webmanifest`, `robots.txt`, `sitemap.xml` — **new**.
- `server.js` — cache policy (immutable assets, revalidated HTML/CSS/JS), byte-range for video, security headers, `0.0.0.0` binding, honeypot, `/rate` + `/legal` redirects, graceful SIGTERM.
- `vercel.json` — new build rules (mp4/json/xml/txt/webmanifest + `assets/**`), cache and security headers, clean-URL redirects.
- Removed `upscale.css` / `upscale.js` (the old "luxury layer" — magnetic buttons, glow borders, spotlight — no longer used).

**Hero film (client-supplied `apexmp4.mp4`).**

- `assets/video/hero-loop.mp4` — 20s ping-pong loop (forward + reversed) from the 10s source, audio preserved (muted by default), 1280×720, 2.7 MB, `+faststart`.
- `assets/video/hero-loop-sm.mp4` — 854px, no audio, 1.1 MB, served under 760px via `<source media>`.
- `assets/video/hero-poster.jpg` — poster/preload frame.
- Hero frames the film right-of-headline (`object-position: 26%`) with a three-stop scrim; a **Film · sound off** control opts into audio.

**Pictures.**

- `assets/img/` — six new editorial plates generated for this build (gold foil on rag paper, broadcast mic, black marble with gold vein, brass-inlaid charcoal wall, gold thread in tailoring, lit stone apex) plus `og.jpg` (1200×630) built from a frame of the film.
- `assets/brand/monogram-mask.png` — the real logomark extracted from `apexlogo.jpg` as an **alpha mask**, so it renders crisp in gold/bone/ink at any size (header, footer, thanks state, favicon, explainer).
- `assets/brand/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `assets/favicon.png`, `favicon-64.png` — regenerated icon set.
- Every `<img>` now has descriptive `alt`, explicit dimensions where useful, and `loading="lazy"` below the fold. All six plates and the film were visually inspected.

**Monetisation.**

- Rate card: Signal $4,800 · Multiplier $9,600 · Sovereign $24,000 per month, each with a contractual view floor, monthly output, and inclusions; monthly/annual toggle (−15%); enterprise 250M–500M line; "not included: paid media".
- Tier-aware qualifier (plan button → matched tier → lead form), inline invitation form, guarantee merchandising in five places, honest capacity scarcity, trust pages, honeypot.

## 2. Checks performed & actual results

| Check | Result |
|-------|--------|
| jsdom interaction harness (49 assertions: simulator, ROI, toggle, filters, FAQ, modals, qualifier, reset, thanks, invitation, drawer, ids, anchors, alts) | ✅ 49/49, 0 runtime errors |
| HTML validation — `html-validate` recommended | ✅ index/legal/explainer clean; only the intentional muted-autoplay hint |
| CSS parse — `css-tree` | ✅ 0 errors (styles.css, explainer.css) |
| Class audit (HTML classes vs CSS selectors) | ✅ no unstyled components; dead utilities trimmed |
| Server smoke test | ✅ `/`, `/legal.html`, `/explainer.html`, CSS, JS, mp4, poster, plates, mask, manifest, sitemap, robots, `/api/health` all 200 with correct MIME |
| Video headers | ✅ `Cache-Control: immutable` + `Accept-Ranges: bytes` |
| Lead API | ✅ valid → 202 (no DB), invalid → 400, `/rate` → 301 |
| `node --check` app.js / server.js / explainer.js | ✅ pass |
| JS syntax + no console errors in harness | ✅ |

**Not verified:** pixel-level rendering. No browser or system Chromium libs exist in this sandbox (playwright/puppeteer downloads are blocked and `libnss3`/`libgbm` are absent), so the layout was verified by markup/CSS parsing, a class audit and the DOM harness rather than screenshots. Please eyeball once in a real browser.

## 3. Remaining problems

1. **Leads are not persisted** — `DATABASE_URL` is still unset (no `.env`). API returns 202 and logs locally.
2. **No owner notification** on new leads (email/SMS) — not built.
3. **Case-study claims** — client names, view totals and quotes carried over from the prior build. The legal copy now presents them as documented engagements, but they still need a human confirmation that each is real and permissioned before public launch.
4. **Rates are placeholders** in the right order of magnitude — set real numbers in `index.html` (`data-monthly` / `data-annual`, JSON-LD `Service.offers`).
5. **No self-serve checkout** — deliberately consultative. `data-plan` / `data-plan-price` are on each button if Stripe is added later.
6. **`apexmp4.mp4` (10s source, 3.3 MB) still sits in the repo root.** Kept as the master; safe to delete once the encoders in `assets/video/` are final.

## 4. Next concrete action

1. Look at the site in a browser at desktop/tablet/mobile widths and confirm the hero film framing and type sizes.
2. Set `DATABASE_URL` in `.env` → run `schema.sql` → submit a test lead → confirm the row.
3. Replace placeholder rates and confirm the client case studies before public launch.

## 5. New decisions & corrections

- **Hero film treatment**: ping-pong loop (no visible cut) with the original audio bed retained but muted; audio is opt-in via the film control. Mobile gets a lighter, silent encode.
- **Logo**: rather than placing a JPG lockup, the mark was extracted as an alpha mask so it inherits CSS colour and stays sharp — the previous build's JPG-in-header approach looked soft against the dark ground.
- **Palette**: the old gold `#D4AF37` + emerald/cyan trio read as "crypto dashboard". Now champagne `#c9a96e` with a single restrained teal accent.
- **Proof section** moved onto a light "paper" ground so figures read like a research note rather than dashboard cards.
- **Removed** the fake live-purchase toast and the emoji iconography (🛡️ ⚡ 🚀) — replaced with drawn marks and plain copy.
- **Kept** the Vercel Web Analytics snippet and the Neon lead pipeline; `matched_tier` now carries plan context so tier performance is measurable.
