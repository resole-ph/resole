ALTER TABLE "shoe_listing" ALTER COLUMN "image_url_left_side" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shoe_listing" ALTER COLUMN "image_url_right_side" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shoe_listing" DROP COLUMN "image_url_side";