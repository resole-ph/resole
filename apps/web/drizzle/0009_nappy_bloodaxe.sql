CREATE TYPE "public"."caetgory_enum" AS ENUM('running', 'basketball', 'football', 'casual', 'other');--> statement-breakpoint
CREATE TYPE "public"."voucher_enum" AS ENUM('percent_off', 'price_off', 'free_coins');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."ticket_status_enum" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "tracking_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"status" text NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric,
	"voucher_type" "voucher_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_redeem" (
	"id" serial PRIMARY KEY NOT NULL,
	"voucher_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" integer,
	"title" text NOT NULL,
	"issue" text NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status_enum" DEFAULT 'open' NOT NULL,
	"priority" "ticket_priority_enum" DEFAULT 'medium' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"lister_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"transaction_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_user_check" CHECK ("conversation"."lister_id" != "conversation"."recipient_id")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" integer NOT NULL,
	"reply_to" integer,
	"content" text NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "message_reply_check" CHECK ("message"."id" != "message"."reply_to")
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_buy_now" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quantity_check" CHECK ("cart_item"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "save" RENAME COLUMN "listing_id" TO "shoe_id";--> statement-breakpoint
ALTER TABLE "donation" DROP CONSTRAINT "pickup_date_check";--> statement-breakpoint
ALTER TABLE "donation" DROP CONSTRAINT "shipped_date_check";--> statement-breakpoint
ALTER TABLE "save" DROP CONSTRAINT "save_listing_id_shoe_listing_id_fk";
--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "coins_earned" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shoe" ADD COLUMN "category" "caetgory_enum" DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD COLUMN "is_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "is_accepted" boolean;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "tracking_event" ADD CONSTRAINT "tracking_event_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_redeem" ADD CONSTRAINT "voucher_redeem_voucher_id_voucher_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."voucher"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_redeem" ADD CONSTRAINT "voucher_redeem_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_lister_id_user_id_fk" FOREIGN KEY ("lister_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_reply_to_message_id_fk" FOREIGN KEY ("reply_to") REFERENCES "public"."message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tracking_event_transaction_id_idx" ON "tracking_event" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "voucher_pkey" ON "voucher" USING btree ("id");--> statement-breakpoint
CREATE INDEX "voucher_redeem_user_id_idx" ON "voucher_redeem" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_user_id_idx" ON "ticket" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_transaction_id_idx" ON "ticket" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "ticket_status_idx" ON "ticket" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversation_lister_id_idx" ON "conversation" USING btree ("lister_id");--> statement-breakpoint
CREATE INDEX "conversation_recipient_id_idx" ON "conversation" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "conversation_transaction_id_idx" ON "conversation" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "message_user_id_idx" ON "message" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "message_conversation_id_idx" ON "message" USING btree ("conversation_id");--> statement-breakpoint
ALTER TABLE "save" ADD CONSTRAINT "save_shoe_id_shoe_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "donation_transaction_id_idx" ON "donation" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "donation_charity_id_idx" ON "donation" USING btree ("charity_id");--> statement-breakpoint
CREATE INDEX "redemption_sale_id_idx" ON "redemption" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_transaction_id_idx" ON "sale" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "swap_transaction_id_idx" ON "swap" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "swap_item_swap_id_idx" ON "swap_item" USING btree ("swap_id");--> statement-breakpoint
CREATE INDEX "swap_item_item_id_idx" ON "swap_item" USING btree ("swap_item_id");--> statement-breakpoint
CREATE INDEX "transaction_listing_id_idx" ON "transaction" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "transaction_recipient_id_idx" ON "transaction" USING btree ("recipient_id");--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN "pickup_date";--> statement-breakpoint
ALTER TABLE "donation" DROP COLUMN "shipped_date";