ALTER TABLE "shoe_listing" DROP CONSTRAINT "size_check";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "unit" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "unit" SET DEFAULT 'us_m'::text;--> statement-breakpoint
DROP TYPE "public"."unit_enum";--> statement-breakpoint
CREATE TYPE "public"."unit_enum" AS ENUM('us_m', 'us_w', 'eur', 'uk', 'jp_cm');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "unit" SET DEFAULT 'us_m'::"public"."unit_enum";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "unit" SET DATA TYPE "public"."unit_enum" USING (
  CASE "unit"
    WHEN 'us' THEN 'us_m'
    WHEN 'uk' THEN 'uk'
    WHEN 'eu' THEN 'eur'
    WHEN 'au' THEN 'uk'
    WHEN 'mx' THEN 'us_m'
    WHEN 'mm' THEN 'jp_cm'
    WHEN 'cm' THEN 'jp_cm'
    WHEN 'in' THEN 'us_m'
    ELSE 'us_m'
  END
)::"public"."unit_enum";--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD CONSTRAINT "size_check" CHECK ("shoe_listing"."size" >= 3 AND "shoe_listing"."size" <= 16);