-- Migration 001: Enable earthdistance + pg_trgm for indexed geo and text search.
-- Works on standard Railway PostgreSQL (no PostGIS required).
-- Run once:  psql $DATABASE_URL -f scripts/migrations/001_postgis_trgm.sql

-- 1. Extensions (cube is required by earthdistance)
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. GiST index on ll_to_earth(lat, lng) — powers earth_box proximity search,
--    turning nearby queries from O(n) full scan to O(log n) index lookup.
CREATE INDEX IF NOT EXISTS idx_charger_stations_earthdist
  ON charger_stations
  USING GIST (ll_to_earth(latitude::float, longitude::float));

-- 3. pg_trgm GIN indexes — power similarity() search on text columns
CREATE INDEX IF NOT EXISTS idx_cs_station_name_trgm ON charger_stations USING GIN (station_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cs_city_trgm         ON charger_stations USING GIN (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cs_address_trgm      ON charger_stations USING GIN (address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cs_operator_trgm     ON charger_stations USING GIN (operator_name gin_trgm_ops);
