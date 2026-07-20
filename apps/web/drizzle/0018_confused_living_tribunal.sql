CREATE TYPE "public"."classification_enum" AS ENUM('men', 'women', 'children');--> statement-breakpoint
CREATE TYPE "public"."unit_enum" AS ENUM('us', 'uk', 'eu', 'au', 'mx', 'mm', 'cm', 'in');--> statement-breakpoint
CREATE TABLE "listing_view" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"viewer_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_view" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_user_id" text NOT NULL,
	"viewer_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profile_view_self_check" CHECK ("profile_view"."profile_user_id" != "profile_view"."viewer_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "unit" "unit_enum" DEFAULT 'us';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "classification" "classification_enum" DEFAULT 'men';--> statement-breakpoint
ALTER TABLE "listing_view" ADD CONSTRAINT "listing_view_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_view" ADD CONSTRAINT "listing_view_viewer_id_user_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_view" ADD CONSTRAINT "profile_view_profile_user_id_user_id_fk" FOREIGN KEY ("profile_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_view" ADD CONSTRAINT "profile_view_viewer_id_user_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_view_listing_id_idx" ON "listing_view" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_view_viewer_id_idx" ON "listing_view" USING btree ("viewer_id");--> statement-breakpoint
CREATE INDEX "profile_view_profile_user_id_idx" ON "profile_view" USING btree ("profile_user_id");--> statement-breakpoint
CREATE INDEX "profile_view_viewer_id_idx" ON "profile_view" USING btree ("viewer_id");