-- Run after migration 0024 in local/staging only. All fixtures are rolled back.
BEGIN;

DO $$
DECLARE
  v_now timestamp := timestamp '2030-01-01 00:00:00';
  v_owner text := 'retention-test-owner';
  v_buyer text := 'retention-test-buyer';
  v_shoe integer;
  v_young integer;
  v_due integer;
  v_unavailable integer;
  v_transaction integer;
BEGIN
  INSERT INTO public."user" (id, name, email) VALUES
    (v_owner, 'Retention Owner', 'retention-owner@example.invalid'),
    (v_buyer, 'Retention Buyer', 'retention-buyer@example.invalid');

  INSERT INTO public.shoe (model, brand, embedding)
  VALUES ('Retention Model', 'Retention Brand', array_fill(0::real, ARRAY[1536])::vector)
  RETURNING id INTO v_shoe;

  INSERT INTO public.shoe_listing (
    user_id, shoe_id, value, colorway, size, condition_score, listing_mode,
    image_url_top, image_url_left_side, image_url_right_side, image_url_sole,
    image_url_insole, created_at
  ) VALUES (
    v_owner, v_shoe, 100, 'Young', 9, 9, 'Sale',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/young-top.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/young-left.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/young-right.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/young-sole.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/young-insole.jpg',
    v_now - interval '29 days'
  ) RETURNING id INTO v_young;

  INSERT INTO public.shoe_listing (
    user_id, shoe_id, value, colorway, size, condition_score, listing_mode,
    image_url_top, image_url_left_side, image_url_right_side, image_url_sole,
    image_url_insole, created_at
  ) VALUES (
    v_owner, v_shoe, 200, 'Due', 9, 9, 'Both',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/due-top.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/due-left.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/due-right.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/due-sole.jpg',
    'https://example.supabase.co/storage/v1/object/public/resole-photos/test/due-insole.jpg',
    v_now - interval '30 days'
  ) RETURNING id INTO v_due;

  INSERT INTO public.shoe_listing (
    user_id, shoe_id, value, colorway, size, condition_score, listing_mode,
    is_available, image_url_top, image_url_left_side, image_url_right_side,
    image_url_sole, image_url_insole, created_at
  ) VALUES (
    v_owner, v_shoe, 300, 'Unavailable', 9, 9, 'Swap', false,
    'https://example.invalid/top.jpg', 'https://example.invalid/left.jpg',
    'https://example.invalid/right.jpg', 'https://example.invalid/sole.jpg',
    'https://example.invalid/insole.jpg', v_now - interval '90 days'
  ) RETURNING id INTO v_unavailable;

  INSERT INTO public."transaction" (listing_id, recipient_id, type)
  VALUES (v_due, v_buyer, 'sale') RETURNING id INTO v_transaction;
  INSERT INTO public.conversation (lister_id, recipient_id, transaction_id)
  VALUES (v_owner, v_buyer, v_transaction);
  INSERT INTO public.save (listing_id, user_id) VALUES (v_due, v_buyer);
  INSERT INTO public.cart_item (listing_id, user_id) VALUES (v_due, v_buyer);
  INSERT INTO public.listing_view (listing_id, viewer_id) VALUES (v_due, v_buyer);

  IF public.archive_due_listings(v_now) <> 2 THEN
    RAISE EXCEPTION 'expected both due listings to be archived';
  END IF;
  IF EXISTS (SELECT 1 FROM public.shoe_listing WHERE id = v_young AND archived_at IS NOT NULL) THEN
    RAISE EXCEPTION 'young listing was archived';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.shoe_listing WHERE id = v_unavailable AND archived_at = v_now) THEN
    RAISE EXCEPTION 'unavailable listing did not enter retention at 30 days';
  END IF;
  IF public.archive_due_listings(v_now) <> 0 THEN
    RAISE EXCEPTION 'archive rerun was not idempotent';
  END IF;
  IF public.delete_due_listings(v_now + interval '29 days') <> 0 THEN
    RAISE EXCEPTION 'listing was deleted before 30 archived days';
  END IF;
  IF public.delete_due_listings(v_now + interval '30 days') <> 2 THEN
    RAISE EXCEPTION 'eligible listings were not deleted';
  END IF;
  IF EXISTS (SELECT 1 FROM public.shoe_listing WHERE id = v_due) THEN
    RAISE EXCEPTION 'listing was not deleted';
  END IF;
  IF EXISTS (SELECT 1 FROM public.save WHERE listing_id = v_due)
     OR EXISTS (SELECT 1 FROM public.cart_item WHERE listing_id = v_due)
     OR EXISTS (SELECT 1 FROM public.listing_view WHERE listing_id = v_due) THEN
    RAISE EXCEPTION 'disposable children were not cascaded';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public."transaction"
    WHERE id = v_transaction AND listing_id IS NULL AND listing_snapshot->>'id' = v_due::text
  ) THEN
    RAISE EXCEPTION 'transaction was not detached and snapshotted';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.conversation WHERE transaction_id = v_transaction) THEN
    RAISE EXCEPTION 'conversation history was deleted';
  END IF;
  IF public.delete_due_listings(v_now + interval '30 days') <> 0 THEN
    RAISE EXCEPTION 'deletion rerun was not safe';
  END IF;
END $$;

ROLLBACK;
