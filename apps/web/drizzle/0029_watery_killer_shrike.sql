CREATE TABLE "relist" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"archived_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "swap" ADD COLUMN "top_up" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "relist" ADD CONSTRAINT "relist_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE cascade ON UPDATE no action;