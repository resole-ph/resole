ALTER TABLE "message" ADD COLUMN "transaction_id" integer;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_transaction_id_idx" ON "message" USING btree ("transaction_id");