ALTER TABLE "user" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "contact_no" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_id_account_id_unique" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;