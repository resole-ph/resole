ALTER TABLE "listing_view" DROP CONSTRAINT "listing_view_listing_id_shoe_listing_id_fk";
--> statement-breakpoint
ALTER TABLE "listing_view" ADD CONSTRAINT "listing_view_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoe_listing" DROP COLUMN "deleted_at";
