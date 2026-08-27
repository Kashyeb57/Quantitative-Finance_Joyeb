-- Adds an "owner" flag to each visit so the site owner's own devices can be
-- recognised regardless of IP (a cookie dropped by the dashboard marks them).
-- Run this ONCE, BEFORE relying on the updated Worker's dashboard:
--   wrangler d1 execute site_analytics --file=./migrations/002_owner.sql --remote
--
-- (Fresh installs already get this column from schema.sql — this file is only
-- for a database created before the feature was added. The collect endpoint
-- degrades gracefully until this runs, so no visits are lost in the meantime.)

ALTER TABLE hits ADD COLUMN owner INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_hits_owner ON hits(owner);
