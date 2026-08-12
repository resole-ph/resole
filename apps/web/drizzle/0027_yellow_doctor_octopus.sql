ALTER TYPE "public"."caetgory_enum" ADD VALUE 'lifestyle' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."caetgory_enum" ADD VALUE 'skate' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."caetgory_enum" ADD VALUE 'training' BEFORE 'other';--> statement-breakpoint
ALTER TABLE "shoe_analysis" ADD COLUMN "category" "caetgory_enum" DEFAULT 'other' NOT NULL;