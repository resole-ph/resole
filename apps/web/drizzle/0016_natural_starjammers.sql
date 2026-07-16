ALTER TABLE "conversation" DROP CONSTRAINT "conversation_transaction_id_transaction_id_fk";
--> statement-breakpoint
DROP INDEX "conversation_transaction_id_idx";--> statement-breakpoint
ALTER TABLE "shoe_analysis" ALTER COLUMN "condition_score" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "conversation" DROP COLUMN "transaction_id";