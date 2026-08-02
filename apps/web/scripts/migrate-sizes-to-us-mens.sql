-- One-off data migration: re-anchor shoe_listing.size from EUR to US Men's.
--
-- Context: sizes were nominally stored as EUR, but the AI reads sizes off the
-- shoe in US and the mobile size preference defaulted to 'eur', so most rows
-- were already US values sitting in an EUR-labelled column. The anchor is now
-- US Men's everywhere, so only the genuinely-EUR rows need converting.
--
-- This is deliberately NOT a drizzle migration: it changes data, not schema,
-- and must not enter the drizzle journal.
--
-- Run it ONCE, against a database that has been backed up.

BEGIN;

-- Safety: refuse to run twice. After migration no row should exceed the US
-- Men's chart maximum of 16 (excluding the known-bad row 1, deleted below).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM shoe_listing WHERE size >= 35 AND id <> 1
  ) THEN
    RAISE EXCEPTION 'No EUR-range rows found — migration appears to have run already.';
  END IF;
END $$;

-- 1. Convert the rows that really are EUR. Values come from the shared
--    conversion chart (EUR 42 -> US Men 8.5, EUR 44 -> US Men 10); the
--    threshold is unambiguous because US Men's tops out at 16 and EUR
--    starts at 35, so the two ranges cannot overlap.
UPDATE shoe_listing
SET size = CASE id
             WHEN 21 THEN 8.5   -- was EUR 42 (New Balance 530)
             WHEN 20 THEN 10    -- was EUR 44 (ASICS Novablast 3)
           END,
    updated_at = now()
WHERE id IN (20, 21);

-- 2. Listing 1 holds size 78, which is not a valid size in any system. It got
--    in through a broken validation check (a doubled Number.isNaN that always
--    returned false), now fixed. Delete it as agreed during deployment.
DELETE FROM shoe_listing WHERE id = 1 AND size = 78;

-- 3. Verify: every remaining size must sit inside the US Men's chart range.
DO $$
DECLARE
  bad_count int;
BEGIN
  SELECT count(*) INTO bad_count FROM shoe_listing WHERE size < 3 OR size > 16;
  IF bad_count > 0 THEN
    RAISE EXCEPTION 'Migration left % row(s) outside the US Men''s range 3-16', bad_count;
  END IF;
END $$;

COMMIT;

-- After this has run and verified clean, tighten the column constraint so
-- nothing out of range can be written again. Kept separate because it fails
-- while the size-78 row still exists.
--
--   ALTER TABLE shoe_listing DROP CONSTRAINT size_check;
--   ALTER TABLE shoe_listing ADD CONSTRAINT size_check CHECK (size >= 3 AND size <= 16);
--
-- Note this needs a matching change to the drizzle schema in
-- src/db/subschemas/shoe.schema.ts to avoid re-introducing drift.
