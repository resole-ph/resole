DO $$ BEGIN
    CREATE TYPE "public"."intent_enum" AS ENUM('buy', 'sell', 'explore');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "user" ADD COLUMN "intent" "intent_enum" DEFAULT 'explore' NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;