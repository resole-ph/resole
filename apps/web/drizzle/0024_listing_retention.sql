CREATE EXTENSION IF NOT EXISTS pg_cron;--> statement-breakpoint

ALTER TABLE "shoe_listing" ADD COLUMN IF NOT EXISTS "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN IF NOT EXISTS "listing_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "swap_item" ADD COLUMN IF NOT EXISTS "listing_snapshot" jsonb;--> statement-breakpoint

ALTER TABLE "transaction" ALTER COLUMN "listing_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" DROP CONSTRAINT IF EXISTS "transaction_listing_id_shoe_listing_id_fk";--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_listing_id_shoe_listing_id_fk"
  FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE SET NULL;--> statement-breakpoint

ALTER TABLE "swap_item" ALTER COLUMN "swap_item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "swap_item" DROP CONSTRAINT IF EXISTS "swap_item_swap_item_id_shoe_listing_id_fk";--> statement-breakpoint
ALTER TABLE "swap_item" ADD CONSTRAINT "swap_item_swap_item_id_shoe_listing_id_fk"
  FOREIGN KEY ("swap_item_id") REFERENCES "public"."shoe_listing"("id") ON DELETE SET NULL;--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "shoe_listing_active_retention_idx" ON "shoe_listing" ("created_at")
  WHERE "archived_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shoe_listing_archived_retention_idx" ON "shoe_listing" ("archived_at")
  WHERE "archived_at" IS NOT NULL;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.archive_due_listings(
  p_now timestamp DEFAULT (now() AT TIME ZONE 'utc')
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.shoe_listing
  SET archived_at = p_now,
      is_available = false
  WHERE archived_at IS NULL
    AND created_at <= p_now - interval '30 days';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.delete_due_listings(
  p_now timestamp DEFAULT (now() AT TIME ZONE 'utc')
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_listing public.shoe_listing%ROWTYPE;
  v_snapshot jsonb;
  v_count integer := 0;
BEGIN
  FOR v_listing IN
    SELECT sl.*
    FROM public.shoe_listing sl
    WHERE sl.archived_at IS NOT NULL
      AND sl.archived_at <= p_now - interval '30 days'
    ORDER BY sl.archived_at, sl.id
    FOR UPDATE SKIP LOCKED
  LOOP
    SELECT jsonb_build_object(
      'id', v_listing.id,
      'userId', v_listing.user_id,
      'shoeId', v_listing.shoe_id,
      'value', v_listing.value,
      'colorway', v_listing.colorway,
      'size', v_listing.size,
      'conditionScore', v_listing.condition_score,
      'listingMode', v_listing.listing_mode,
      'createdAt', v_listing.created_at,
      'archivedAt', v_listing.archived_at,
      'shoe', jsonb_build_object('id', s.id, 'brand', s.brand, 'model', s.model, 'category', s.category),
      'owner', jsonb_build_object('id', u.id, 'name', u.name, 'image', u.image, 'city', u.city)
    ) INTO v_snapshot
    FROM public.shoe s
    JOIN public."user" u ON u.id = v_listing.user_id
    WHERE s.id = v_listing.shoe_id;

    UPDATE public."transaction"
    SET listing_snapshot = COALESCE(listing_snapshot, v_snapshot), listing_id = NULL
    WHERE listing_id = v_listing.id;

    UPDATE public.swap_item
    SET listing_snapshot = COALESCE(listing_snapshot, v_snapshot), swap_item_id = NULL
    WHERE swap_item_id = v_listing.id;

    DELETE FROM public.shoe_listing WHERE id = v_listing.id;
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;--> statement-breakpoint

REVOKE ALL ON FUNCTION public.archive_due_listings(timestamp) FROM PUBLIC, anon, authenticated;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.delete_due_listings(timestamp) FROM PUBLIC, anon, authenticated;--> statement-breakpoint

DO $$
DECLARE v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'archive-listings-daily';
  IF v_job_id IS NOT NULL THEN PERFORM cron.unschedule(v_job_id); END IF;
  PERFORM cron.schedule('archive-listings-daily', '0 0 * * *', 'SELECT public.archive_due_listings();');

  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'delete-archived-listings-daily';
  IF v_job_id IS NOT NULL THEN PERFORM cron.unschedule(v_job_id); END IF;
  PERFORM cron.schedule(
    'delete-archived-listings-daily',
    '5 0 * * *',
    'SELECT public.delete_due_listings();'
  );
END $$;
