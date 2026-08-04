ALTER TABLE "message" ADD COLUMN "attachment" jsonb;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_content_or_attachment_check" CHECK (length(trim("message"."content")) > 0 OR "message"."attachment" IS NOT NULL);--> statement-breakpoint

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inbox-photos',
  'inbox-photos',
  false,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;--> statement-breakpoint

-- Resole authenticates through its own session table, so inbox objects are
-- server-managed. The service role bypasses RLS only after the API has checked
-- conversation membership; anon/authenticated Supabase clients are denied.
DROP POLICY IF EXISTS "Inbox photos are server managed" ON storage.objects;--> statement-breakpoint
CREATE POLICY "Inbox photos are server managed"
ON storage.objects
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (bucket_id <> 'inbox-photos')
WITH CHECK (bucket_id <> 'inbox-photos');
