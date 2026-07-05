CREATE TYPE "public"."price_source_enum" AS ENUM('catalog', 'ai-estimate');--> statement-breakpoint
CREATE TABLE "shoe_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"colorway" text NOT NULL,
	"size" text NOT NULL,
	"year" integer NOT NULL,
	"condition_score" integer NOT NULL,
	"description" text NOT NULL,
	"defects" text[] DEFAULT '{}' NOT NULL,
	"estimated_price" numeric NOT NULL,
	"pricing" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shoe_listing" ALTER COLUMN "listing_mode" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "shoe_listing" ALTER COLUMN "listing_mode" SET DEFAULT 'Both'::text;--> statement-breakpoint
DROP TYPE "public"."listing_enum";--> statement-breakpoint
CREATE TYPE "public"."listing_enum" AS ENUM('Sale', 'Swap', 'Both');--> statement-breakpoint
ALTER TABLE "shoe_listing" ALTER COLUMN "listing_mode" SET DEFAULT 'Both'::"public"."listing_enum";--> statement-breakpoint
ALTER TABLE "shoe_listing" ALTER COLUMN "listing_mode" SET DATA TYPE "public"."listing_enum" USING "listing_mode"::"public"."listing_enum";