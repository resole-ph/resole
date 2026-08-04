ALTER TABLE "charity" ADD COLUMN "image" text;--> statement-breakpoint

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'charity-images',
  'charity-images',
  true,
  20971520,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;--> statement-breakpoint

-- Charity logos are public assets, but writes remain server-managed. The
-- service role bypasses this policy for the operational upload script.
DROP POLICY IF EXISTS "Charity images are server managed" ON storage.objects;--> statement-breakpoint
CREATE POLICY "Charity images are server managed"
ON storage.objects
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (bucket_id <> 'charity-images')
WITH CHECK (bucket_id <> 'charity-images');
