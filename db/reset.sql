-- reset.sql — Drop all tables and recreate
-- Run: psql -d epl -f db/reset.sql

DROP TABLE IF EXISTS squad_memberships CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;

\i db/schema.sql
