CREATE TYPE "public"."listing_enum" AS ENUM('sale', 'swap', 'both');--> statement-breakpoint
CREATE TYPE "public"."task_enum" AS ENUM('sale', 'swap', 'donate', 'refer', 'rating', 'save', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_enum" AS ENUM('sale', 'swap', 'donate');--> statement-breakpoint
CREATE TYPE "public"."referal_enum" AS ENUM('facebook', 'messenger', 'x', 'instagram', 'code', 'other');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "login" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"address" text,
	"city" text,
	"contact_no" text,
	"description" text DEFAULT 'I love shoes!',
	"coins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charity" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"description" text NOT NULL,
	"coordinator" text NOT NULL,
	"email" text NOT NULL,
	"contact_no" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "shoe" (
	"id" serial PRIMARY KEY NOT NULL,
	"model" text NOT NULL,
	"brand" text NOT NULL,
	"co2_footprint" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shoe_model_brand_unique" UNIQUE("model","brand"),
	CONSTRAINT "co2_footprint_check" CHECK ("shoe"."co2_footprint" >= 0)
);
--> statement-breakpoint
CREATE TABLE "shoe_listing" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"shoe_id" integer NOT NULL,
	"value" numeric NOT NULL,
	"description" text,
	"colorway" text NOT NULL,
	"size" numeric NOT NULL,
	"condition_score" numeric NOT NULL,
	"defects" text[],
	"is_refurbished" boolean DEFAULT false NOT NULL,
	"listing_mode" "listing_enum" DEFAULT 'both' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "value_check" CHECK ("shoe_listing"."value" > 0),
	CONSTRAINT "size_check" CHECK ("shoe_listing"."size" > 0),
	CONSTRAINT "condition_score_check" CHECK ("shoe_listing"."condition_score" > 0)
);
--> statement-breakpoint
CREATE TABLE "shoe_price" (
	"id" serial PRIMARY KEY NOT NULL,
	"shoe_id" integer NOT NULL,
	"price" numeric NOT NULL,
	"source" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_check" CHECK ("shoe_price"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"task" "task_enum" DEFAULT 'other' NOT NULL,
	"coins_reward" integer NOT NULL,
	CONSTRAINT "coins_reward_check" CHECK ("task"."coins_reward" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "expires_at_check" CHECK ("user_task"."expires_at" > "user_task"."created_at"),
	CONSTRAINT "completed_at_check" CHECK ("user_task"."expires_at" BETWEEN "user_task"."created_at" AND "user_task"."expires_at")
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"charity_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"pickup_date" timestamp,
	"shipped_date" timestamp,
	CONSTRAINT "pickup_date" CHECK ("donation"."pickup_date" > "donation"."created_at"),
	CONSTRAINT "shipped_date" CHECK ("donation"."shipped_date" > "donation"."pickup_date")
);
--> statement-breakpoint
CREATE TABLE "redemption" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"coins_redeemed" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coins_redeemed_check" CHECK ("redemption"."coins_redeemed" > 0)
);
--> statement-breakpoint
CREATE TABLE "sale" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "price_check" CHECK ("sale"."price" > 0)
);
--> statement-breakpoint
CREATE TABLE "swap" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swap_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"swap_id" integer NOT NULL,
	"swap_item_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"recipient_id" integer,
	"type" "transaction_enum" NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"coins_earned" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coins_earned_check" CHECK ("transaction"."coins_earned" > 0)
);
--> statement-breakpoint
CREATE TABLE "rating" (
	"referals" serial PRIMARY KEY NOT NULL,
	"rater_id" integer NOT NULL,
	"ratee_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "rating_id_check" CHECK ("rating"."rater_id" != "rating"."ratee_id"),
	CONSTRAINT "rating_check" CHECK ("rating"."rating" BETWEEN 0 AND 5)
);
--> statement-breakpoint
CREATE TABLE "referal" (
	"referals" serial PRIMARY KEY NOT NULL,
	"refered_by_id" integer NOT NULL,
	"refered_to_id" integer NOT NULL,
	"method" "referal_enum" DEFAULT 'other' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referal_id_check" CHECK ("referal"."refered_by_id" != "referal"."refered_to_id")
);
--> statement-breakpoint
CREATE TABLE "save" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login" ADD CONSTRAINT "login_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD CONSTRAINT "shoe_listing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoe_listing" ADD CONSTRAINT "shoe_listing_shoe_id_shoe_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoe_price" ADD CONSTRAINT "shoe_price_shoe_id_shoe_id_fk" FOREIGN KEY ("shoe_id") REFERENCES "public"."shoe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_task" ADD CONSTRAINT "user_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_task" ADD CONSTRAINT "user_task_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_charity_id_charity_id_fk" FOREIGN KEY ("charity_id") REFERENCES "public"."charity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemption" ADD CONSTRAINT "redemption_sale_id_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swap" ADD CONSTRAINT "swap_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swap_item" ADD CONSTRAINT "swap_item_swap_id_swap_id_fk" FOREIGN KEY ("swap_id") REFERENCES "public"."swap"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swap_item" ADD CONSTRAINT "swap_item_swap_item_id_shoe_listing_id_fk" FOREIGN KEY ("swap_item_id") REFERENCES "public"."shoe_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_rater_id_user_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_ratee_id_user_id_fk" FOREIGN KEY ("ratee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referal" ADD CONSTRAINT "referal_refered_by_id_user_id_fk" FOREIGN KEY ("refered_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referal" ADD CONSTRAINT "referal_refered_to_id_user_id_fk" FOREIGN KEY ("refered_to_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "save" ADD CONSTRAINT "save_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "save" ADD CONSTRAINT "save_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;