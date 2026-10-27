// Apex Scale — Vercel serverless health check. Served at GET /api/health.
// Returns whether the Neon CRM (DATABASE_URL) is configured.

module.exports = function handler(req, res) {
  res.status(200).json({
    ok: true,
    crm: !!process.env.DATABASE_URL,
    time: new Date().toISOString(),
  });
};
