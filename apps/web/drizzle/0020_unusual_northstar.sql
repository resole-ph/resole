ALTER TABLE "rating" ADD COLUMN "transaction_id" integer;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rating_transaction_id_idx" ON "rating" USING btree ("transaction_id");