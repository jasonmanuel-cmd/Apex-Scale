-- Apex Scale — Neon CRM schema
-- Run this once in the Neon SQL Editor (or: psql "$DATABASE_URL" -f schema.sql)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       text NOT NULL,
  email           text NOT NULL,
  phone           text,
  company         text,
  revenue_tier    text,           -- under-1m | 1m-3m | 3m-10m | 10m-plus
  media_readiness text,           -- podcast | film-ready | ugc-needed
  objective       text,           -- omnipresence | pipeline | valuation
  matched_tier    text,           -- e.g. "APEX SCALE: 100M GUARANTEE"
  status          text NOT NULL DEFAULT 'new',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);

-- Convenience view for the team
CREATE OR REPLACE VIEW leads_newest AS
  SELECT * FROM leads ORDER BY created_at DESC;
