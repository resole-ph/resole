ALTER TABLE "save" RENAME COLUMN "shoe_id" TO "listing_id";--> statement-breakpoint
ALTER TABLE "save" DROP CONSTRAINT "save_shoe_id_shoe_id_fk";
--> statement-breakpoint
ALTER TABLE "shoe" ALTER COLUMN "co2_footprint" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "save" ADD CONSTRAINT "save_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE cascade ON UPDATE no action;