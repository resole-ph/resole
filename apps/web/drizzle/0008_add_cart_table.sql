CREATE TABLE "cart_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"is_buy_now" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_listing_id_shoe_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."shoe_listing"("id") ON DELETE cascade ON UPDATE no action;
