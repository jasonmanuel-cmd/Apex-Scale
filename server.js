// Apex Scale — static site + Neon CRM lead-capture API
// Serves the site (index.html, legal, film, assets) AND exposes POST /api/leads.
//
// Quick start:
//   1. npm install
//   2. copy .env.example -> .env and paste your Neon DATABASE_URL
//   3. run schema.sql in the Neon SQL Editor (or: psql "$DATABASE_URL" -f schema.sql)
//   4. npm start   ->  http://localhost:3333
//
// Without DATABASE_URL the form still works: leads are logged locally and the
// API returns 202 "captured, not persisted".

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3333;

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '32kb' }));

// --- Static assets with sensible cache policy --------------------------------
const staticOpts = {
  setHeaders(res, filePath) {
    const rel = path.relative(__dirname, filePath).replace(/\\/g, '/');
    if (/\.(mp4|jpg|jpeg|png|webp|svg|woff2?)$/i.test(rel)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(css|js)$/i.test(rel)) {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    if (rel.endsWith('.mp4')) res.setHeader('Accept-Ranges', 'bytes');
  }
};

app.use(express.static(__dirname, staticOpts));

// --- Security headers (no external script dependencies beyond fonts/analytics)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// --- Neon (Postgres) client --------------------------------------------------
let neon = null;
if (process.env.DATABASE_URL) {
  try {
    const { neon: createNeon } = require('@neondatabase/serverless');
    neon = createNeon(process.env.DATABASE_URL);
    console.log('[crm] Neon client initialised.');
  } catch (err) {
    console.warn('[crm] @neondatabase/serverless not installed — run: npm install');
    console.warn('[crm] reason:', err.message);
  }
}

const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const cap = (v, n) => String(v || '').trim().slice(0, n);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, crm: !!neon, time: new Date().toISOString() });
});

app.post('/api/leads', async (req, res) => {
  const b = req.body || {};
  const lead = {
    full_name: cap(b.full_name, 120),
    email: cap(b.email, 254).toLowerCase(),
    phone: cap(b.phone, 40),
    company: cap(b.company, 160),
    revenue_tier: cap(b.revenue_tier, 32),
    media_readiness: cap(b.media_readiness, 32),
    objective: cap(b.objective, 32),
    matched_tier: cap(b.matched_tier, 120)
  };

  if (!lead.full_name || !isEmail(lead.email)) {
    return res.status(400).json({ ok: false, error: 'Full name and a valid email are required.' });
  }

  // Honeypot: bots that fill every field get a polite 202 and nothing is stored.
  if (b.website) {
    console.log('[lead] honeypot hit — discarded');
    return res.status(202).json({ ok: true, persisted: false });
  }

  if (!neon) {
    console.log('[lead] captured (not persisted — DATABASE_URL unset):', JSON.stringify(lead));
    return res.status(202).json({ ok: true, persisted: false, message: 'Lead captured (CRM not yet configured).' });
  }

  try {
    const rows = await neon`
      INSERT INTO leads (full_name, email, phone, company, revenue_tier, media_readiness, objective, matched_tier)
      VALUES (${lead.full_name}, ${lead.email}, ${lead.phone}, ${lead.company},
              ${lead.revenue_tier}, ${lead.media_readiness}, ${lead.objective}, ${lead.matched_tier})
      RETURNING id, created_at
    `;
    const row = rows && rows[0];
    console.log('[lead] persisted:', row && row.id);
    return res.status(201).json({ ok: true, persisted: true, id: row && row.id });
  } catch (err) {
    console.error('[lead] insert failed:', err.message);
    return res.status(500).json({ ok: false, error: 'Could not save lead.' });
  }
});

// Friendly fallbacks for the clean URLs used in links/marketing
app.get(['/rate', '/pricing'], (req, res) => res.redirect(301, '/#rate'));
app.get('/legal', (req, res) => res.redirect(301, '/legal.html'));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Apex Scale running:  http://localhost:${PORT}\n  CRM configured:       ${neon ? 'yes' : 'NO (set DATABASE_URL in .env)'}\n`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
