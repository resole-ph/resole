ALTER TABLE "shoe_analysis" ALTER COLUMN "condition_score" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD COLUMN "is_final_price" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD COLUMN "image_url_left_side" text;--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD COLUMN "image_url_right_side" text;--> statement-breakpoint
UPDATE "shoe_listing" SET "image_url_left_side" = "image_url_side", "image_url_right_side" = "image_url_side" WHERE "image_url_left_side" IS NULL;