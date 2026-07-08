ALTER TYPE "public"."voucher_enum" ADD VALUE 'donation';--> statement-breakpoint
ALTER TYPE "public"."voucher_enum" ADD VALUE 'boost';--> statement-breakpoint
ALTER TYPE "public"."voucher_enum" ADD VALUE 'other';--> statement-breakpoint
ALTER TABLE "voucher" ALTER COLUMN "voucher_type" SET DEFAULT 'other';