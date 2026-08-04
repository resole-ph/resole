ALTER TABLE "rating" RENAME COLUMN "raterRole" TO "rater_role";--> statement-breakpoint
DROP INDEX "rating_rater_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "rating_rater_idx" ON "rating" USING btree ("transaction_id","rater_role");