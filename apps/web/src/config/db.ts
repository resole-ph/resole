import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';

config({ path: '../../.env.local', override: true });
config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env or .env.local');
}

// Reuse the same connection pool across Next.js dev-mode hot reloads instead of
// leaking a new `postgres()` pool (and its connections) on every module re-evaluation.
const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

export const sql = globalForDb.sql ?? postgres(connectionString, { max: 5 });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });