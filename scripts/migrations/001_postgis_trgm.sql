-- Migration 001: Enable PostGIS + pg_trgm, add spatial index on charger_stations,
-- add trgm GIN indexes for fast text search.
-- Run once against the Railway (or any production) database:
--   psql $DATABASE_URL -f scripts/migrations/001_postgis_trgm.sql

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add geometry column (POINT, WGS-84) to charger_stations
ALTER TABLE charger_stations
  ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- 3. Backfill from existing lat/lng decimal columns
UPDATE charger_stations
   SET location = ST_SetSRID(ST_MakePoint(longitude::float, latitude::float), 4326)
 WHERE location IS NULL;

-- 4. Spatial index (GIST) — powers ST_DWithin for nearby queries
CREATE INDEX IF NOT EXISTS idx_charger_stations_location
  ON charger_stations USING GIST (location);

-- 5. Trigger: keep location in sync whenever lat/lng are updated
CREATE OR REPLACE FUNCTION sync_charger_location()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude::float, NEW.latitude::float), 4326);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_charger_location ON charger_stations;
CREATE TRIGGER trg_sync_charger_location
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON charger_stations
  FOR EACH ROW EXECUTE FUNCTION sync_charger_location();

-- 6. pg_trgm GIN indexes — power similarity() search on text columns
CREATE INDEX IF NOT EXISTS idx_cs_station_name_trgm ON charger_stations USING GIN (station_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cs_city_trgm         ON charger_stations USING GIN (city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cs_address_trgm      ON charger_stations USING GIN (address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cs_operator_trgm     ON charger_stations USING GIN (operator_name gin_trgm_ops);
