DO $$ BEGIN
    ALTER TABLE "shoe_listing" ADD COLUMN "image_url_top" text NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "shoe_listing" ADD COLUMN "image_url_side" text NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "shoe_listing" ADD COLUMN "image_url_sole" text NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "shoe_listing" ADD COLUMN "image_url_insole" text NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;