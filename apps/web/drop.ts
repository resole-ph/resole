import { db } from './src/config/db';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    await db.execute(sql`ALTER TABLE "conversation" DROP CONSTRAINT IF EXISTS "conversation_transaction_id_transaction_id_fk";`);
    await db.execute(sql`DROP INDEX IF EXISTS "conversation_transaction_id_idx";`);
    await db.execute(sql`ALTER TABLE "conversation" DROP COLUMN IF EXISTS "transaction_id";`);
    console.log("Successfully dropped transaction_id from conversation table.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
