CREATE TYPE "public"."intent_enum" AS ENUM('buy', 'sell', 'explore');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "intent" "intent_enum" DEFAULT 'explore' NOT NULL;