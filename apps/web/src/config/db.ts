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

export const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });