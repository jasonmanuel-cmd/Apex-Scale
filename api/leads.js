// Apex Scale — Vercel serverless function for lead capture (Neon Postgres).
// Served at POST /api/leads. No Express needed on Vercel; the static files
// are served automatically and this function handles the CRM write.
//
// Requires DATABASE_URL set as an environment variable in Vercel
// (Settings -> Environment Variables) or locally in .env.

const { neon } = require('@neondatabase/serverless');

const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const cap = (v, n) => String(v || '').trim().slice(0, n);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const b = req.body || {};
  const lead = {
    full_name: cap(b.full_name, 120),
    email: cap(b.email, 254).toLowerCase(),
    phone: cap(b.phone, 40),
    company: cap(b.company, 160),
    revenue_tier: cap(b.revenue_tier, 32),
    media_readiness: cap(b.media_readiness, 32),
    objective: cap(b.objective, 32),
    matched_tier: cap(b.matched_tier, 120),
  };

  if (!lead.full_name || !isEmail(lead.email)) {
    return res.status(400).json({ ok: false, error: 'Full name and a valid email are required.' });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('[lead] captured (not persisted — DATABASE_URL unset):', JSON.stringify(lead));
    return res.status(202).json({ ok: true, persisted: false, message: 'Lead captured (CRM not yet configured).' });
  }

  try {
    const sql = neon(url);
    const rows = await sql`
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
};
