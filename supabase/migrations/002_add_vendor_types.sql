-- Adds bakery/cafe/catering vendor types and their starter categories.
-- IMPORTANT: run this as TWO separate executions in the SQL editor (Postgres
-- won't let a new enum value be used in the same transaction that adds it).

-- ---------------------------------------------------------------------------
-- STEP 1 — run this block first, then click Run
-- ---------------------------------------------------------------------------
alter type vendor_type add value if not exists 'bakery';
alter type vendor_type add value if not exists 'cafe';
alter type vendor_type add value if not exists 'catering';
