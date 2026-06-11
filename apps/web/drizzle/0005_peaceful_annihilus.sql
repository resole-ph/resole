CREATE TYPE "public"."caetgory_enum" AS ENUM('running', 'basketball', 'football', 'casual', 'other');--> statement-breakpoint
ALTER TABLE "save" RENAME COLUMN "listing_id" TO "shoe_id";--> statement-breakpoint
ALTER TABLE "save" DROP CONSTRAINT "save_listing_id_shoe_listing_id_fk";
--> statement-breakpoint
ALTER TABLE "shoe" ADD COLUMN "category" "caetgory_enum" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "save" ADD CONSTRAINT "save_shoe_id_shoe_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoe"("id") ON DELETE cascade ON UPDATE no action;