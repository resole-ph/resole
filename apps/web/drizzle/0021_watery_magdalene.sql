ALTER TABLE "shoe_listing" DROP CONSTRAINT "size_check";--> statement-breakpoint
ALTER TABLE "rating" DROP CONSTRAINT "rating_check";--> statement-breakpoint
ALTER TABLE "rating" ALTER COLUMN "raterRole" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rating" ALTER COLUMN "raterRole" SET DEFAULT 'recipient'::text;--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DEFAULT 'other'::text;--> statement-breakpoint
DROP TYPE "public"."referal_enum";--> statement-breakpoint
CREATE TYPE "public"."referal_enum" AS ENUM('seller', 'recipient');--> statement-breakpoint
ALTER TABLE "rating" ALTER COLUMN "raterRole" SET DEFAULT 'recipient'::"public"."referal_enum";--> statement-breakpoint
ALTER TABLE "rating" ALTER COLUMN "raterRole" SET DATA TYPE "public"."referal_enum" USING "raterRole"::"public"."referal_enum";--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DEFAULT 'other'::"public"."referal_enum";--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DATA TYPE "public"."referal_enum" USING "method"::"public"."referal_enum";--> statement-breakpoint
DROP INDEX "rating_transaction_id_idx";--> statement-breakpoint
ALTER TABLE "rating" ADD COLUMN "raterRole" "referal_enum" DEFAULT 'recipient' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "rating_rater_idx" ON "rating" USING btree ("transaction_id","raterRole");--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD CONSTRAINT "size_check" CHECK ("shoe_listing"."size" >= 3 AND "shoe_listing"."size" <= 16);--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_check" CHECK ("rating"."rating" BETWEEN 1 AND 5);