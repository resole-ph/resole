-- One-off cleanup: remove listing 1 and everything hanging off it.
--
-- Listing 1 (Nike Air Force 1 Low, red) holds size 78, which is not a valid
-- size in any system. It got in through a broken validation check — a doubled
-- Number.isNaN that wrapped a boolean and so could never fire — now fixed in
-- apps/web/src/features/shoe/services/service.ts.
--
-- The size cannot be corrected: the listing predates the AI pipeline (created
-- 10:47, earliest shoe_analysis 11:27 the same day) so there is no record of
-- what the shoe actually was.
--
-- Deleting the listing alone fails, because transaction.listing_id has no
-- ON DELETE rule. The 8 referencing transactions are all is_completed = false
-- and is_accepted = null, created 2026-07-08, i.e. day-one test data. They and
-- their sale/swap children are removed here in FK order.
--
-- save (2 rows) and listing_view (11 rows) cascade automatically and are not
-- listed explicitly.
--
-- Run it ONCE, against a database that has been backed up. Run
-- migrate-sizes-to-us-mens.sql first.

BEGIN;

-- Guard: only proceed if this is still the row we investigated. If listing 1
-- is absent or its size has changed, something is different from what this
-- script was written against — stop rather than delete the wrong thing.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM shoe_listing WHERE id = 1 AND size = 78) THEN
    RAISE EXCEPTION 'Listing 1 is missing or no longer has size 78 — aborting.';
  END IF;
END $$;

-- Guard: refuse to delete transaction history that turned out to be real.
DO $$
DECLARE
  live_count int;
BEGIN
  SELECT count(*) INTO live_count
  FROM transaction
  WHERE listing_id = 1 AND (is_completed OR is_accepted IS TRUE);
  IF live_count > 0 THEN
    RAISE EXCEPTION 'Listing 1 has % completed or accepted transaction(s) — aborting.', live_count;
  END IF;
END $$;

-- Delete children before parents, following the FK graph inwards.
DELETE FROM swap_item
WHERE swap_id IN (
  SELECT id FROM swap WHERE transaction_id IN (SELECT id FROM transaction WHERE listing_id = 1)
);

DELETE FROM swap
WHERE transaction_id IN (SELECT id FROM transaction WHERE listing_id = 1);

DELETE FROM sale
WHERE transaction_id IN (SELECT id FROM transaction WHERE listing_id = 1);

DELETE FROM transaction WHERE listing_id = 1;

-- Finally the listing itself; save and listing_view cascade from here.
DELETE FROM shoe_listing WHERE id = 1;

-- Verify nothing is left behind and every surviving size is in range.
DO $$
DECLARE
  bad_count int;
BEGIN
  IF EXISTS (SELECT 1 FROM shoe_listing WHERE id = 1) THEN
    RAISE EXCEPTION 'Listing 1 still present after delete.';
  END IF;
  IF EXISTS (SELECT 1 FROM transaction WHERE listing_id = 1) THEN
    RAISE EXCEPTION 'Transactions for listing 1 still present after delete.';
  END IF;
  SELECT count(*) INTO bad_count FROM shoe_listing WHERE size < 3 OR size > 16;
  IF bad_count > 0 THEN
    RAISE EXCEPTION '% listing(s) still outside the US Men''s range 3-16', bad_count;
  END IF;
END $$;

COMMIT;

-- With every size now in range, the column constraint can be tightened:
--
--   ALTER TABLE shoe_listing DROP CONSTRAINT size_check;
--   ALTER TABLE shoe_listing ADD CONSTRAINT size_check CHECK (size >= 3 AND size <= 16);
--
-- Apply the matching change to src/db/subschemas/shoe.schema.ts at the same
-- time, or drizzle will report drift on the next generate.
