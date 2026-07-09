CREATE TABLE "notification_preference" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing" boolean DEFAULT true NOT NULL,
	"offer" boolean DEFAULT true NOT NULL,
	"promotion" boolean DEFAULT true NOT NULL,
	"system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preference_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;