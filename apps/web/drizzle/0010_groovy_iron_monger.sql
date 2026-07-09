ALTER TABLE "user" ALTER COLUMN "intent" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "intent" SET DEFAULT 'buy'::text;--> statement-breakpoint
UPDATE "user" SET "intent" = 'buy' WHERE "intent" = 'explore';--> statement-breakpoint
DROP TYPE "public"."intent_enum";--> statement-breakpoint
CREATE TYPE "public"."intent_enum" AS ENUM('buy', 'sell', 'donate');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "intent" SET DEFAULT 'buy'::"public"."intent_enum";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "intent" SET DATA TYPE "public"."intent_enum" USING "intent"::"public"."intent_enum";