CREATE TYPE "public"."role_enum" AS ENUM('seller', 'recipient');--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DEFAULT 'other'::text;--> statement-breakpoint
DROP TYPE "public"."referal_enum";--> statement-breakpoint
CREATE TYPE "public"."referal_enum" AS ENUM('facebook', 'messenger', 'x', 'instagram', 'code', 'other');--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DEFAULT 'other'::"public"."referal_enum";--> statement-breakpoint
ALTER TABLE "referal" ALTER COLUMN "method" SET DATA TYPE "public"."referal_enum" USING "method"::"public"."referal_enum";--> statement-breakpoint
ALTER TABLE "rating" ALTER COLUMN "rater_role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rating" ALTER COLUMN "rater_role" SET DATA TYPE "public"."role_enum" USING "rater_role"::text::"public"."role_enum";--> statement-breakpoint
ALTER TABLE "rating" ALTER COLUMN "rater_role" SET DEFAULT 'recipient';