# Apex Scale — Project Record

Repo: `jasonmanuel-cmd/Apex-Scale` · Branch: `main`
Last updated: 2026-10-27

---

## 1. Changes made & files affected

**Session A — recovery & rebuild (this agent):**
- Recovered the project from an empty GitHub repo + local `C:\Users\blunt\apex-scale\` (was a Gemini-CLI build).
- Fixed two stripped `$` signs in `index.html` (announcement bar + "Effective CPM" row).
- Added the Neon CRM scaffold: `server.js` (Express + `POST /api/leads`), `schema.sql` (`leads` table), `.env.example`.
- Wired the lead form (`app.js`) to `POST /api/leads`.
- Added the luxury layer: `upscale.css` + `upscale.js` (magnetic buttons, glowing borders, animated counters, scroll reveal, cursor spotlight, button shine).
- Added the animated explainer: `explainer.html` + `explainer.css` + `explainer.js`.
- Added brand images: `assets/` (6 source JPGs) + generated `assets/favicon.png` (64px) and `assets/logo-mark.png` (128px). Placed them: favicon (square logo), header/footer mark (circular logo), final-CTA visual (`apexlbusiness.jpg`), footer lockup (`apexlogo3.jpg`).

**Session B — Vercel integration (parallel, by `vercel[bot]`; preserved, not authored here):**
- Added `api/health.js`, `api/leads.js` (serverless lead-capture + health).
- Added `vercel.json`, Vercel routing fixes, a "living network background" (`#bg-network` canvas), and Web Analytics (`/_vercel/insights/script.js` in `index.html` + `explainer.html`).

## 2. Checks performed & actual results

| Check | Result |
|-------|--------|
| Server boots (`npm start`) | ✅ `GET /api/health` → `200 {"ok":true,"crm":false}` |
| Lead API, valid payload | ✅ `202` (captured, "not persisted" until DATABASE_URL set) |
| Lead API, invalid payload | ✅ `400` validation works |
| JS syntax (`node -c`) | ✅ app.js, server.js pass |
| Playwright DOM (luxury layer) | ✅ magnetic/glow-border/reveal classes applied; 3 `.count-up`; 20 `.reveal`; spotlight present; counters animating |
| Explainer | ✅ 6 scenes, 6 dots, canvas present, no errors |
| Brand images | ✅ all 4 `<img>` load (naturalWidth > 0), favicon linked |
| Console errors | ✅ 0 real errors. (2 harmless 404s from `/_vercel/insights/script.js` on **localhost only** — that script is served by Vercel in production) |
| Secret scan (tracked files) | ✅ clean — no keys/tokens/passwords/real connection strings |
| Accidental-file scan | ✅ no `.env`, `.vercel`, or `node_modules` tracked |
| Git sync | ✅ local `main` == `origin/main` |

## 3. Remaining problems

1. **Leads are not persisted yet** — `DATABASE_URL` is not set (no `.env`). Until then, `POST /api/leads` returns `202` and logs locally only.
2. **No owner notification** — nothing emails/texts you when a lead submits ("SMS in 15 min" is page copy only).
3. **No real booking** — "Book Growth Blueprint Call" doesn't attach a calendar.
4. **No leads dashboard** — leads would only be visible in raw Neon tables.
5. **Legal/trust risk** — site names real people (Dan Bilzerian, Garrett Gunderson, Dr. Pompa) as clients with specific metrics, plus "guaranteed views or free." If those aren't actual clients, this is deceptive-marketing risk. Privacy Policy / Terms are empty `#` links.
6. **No spam/bot protection** on the lead form.
7. **Unused assets** — `apexlogo.jpg` and `apexlogo2.jpg` are in `assets/` but not placed (alternate logo drafts).

## 4. Next concrete action

1. Create a Neon project → paste the connection string into `.env` (`DATABASE_URL=…`) → run `schema.sql` in the Neon SQL Editor → restart `npm start`.
2. Then: email/SMS notification on new leads, and a Calendly/Cal.com link on the booking buttons.
3. Before going public: resolve the client-name/testimonial claims and the empty Privacy/Terms pages.

## 5. New decisions & corrections

- **Logo placement**: circular logo (`apexcirlogo.jpg`) for header/footer mark; square logo (`apexlogosq.jpg`) for favicon; `apexlbusiness.jpg` in the final CTA; `apexlogo3.jpg` as footer lockup. (Placed by filename — agent cannot view images; needs a human visual confirm.)
- **Design approach**: kept the static HTML/CSS/JS site and layered enhancements on top (vs. a full Next.js rewrite).
- **Explainer approach**: self-contained animated web page (vs. a HyperFrames MP4 render, which needs the HeyGen CLI + render credits).
- **Corrections**: restored `$` signs lost to shell escaping; reconciled a parallel Vercel push via clean `git pull --rebase` (no force-push, no lost work).
