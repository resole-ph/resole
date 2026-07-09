import { 
  pgTable,
  pgEnum, 
  text, 
  timestamp, 
  integer,
  serial,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';

export const taskEnum = pgEnum('task_enum', [
  'sale',
  'swap',
  'donate',
  'refer',
  'rating',
  'save',
  'other'
]);

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  task: taskEnum('task').default('other').notNull(),
  coinsReward: integer('coins_reward').notNull()
}, (table) => [
  check('coins_reward_check', sql`${table.coinsReward} >= 0`)
]);

export const userTask = pgTable('user_task', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  taskId: integer('task_id')
    .notNull()
    .references(() => task.id, { onDelete: 'cascade'}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  completedAt: timestamp('completed_at')
}, (table) => [
  check('expires_at_check', sql`${table.expiresAt} > ${table.createdAt}`),
  check('completed_at_check', sql`${table.completedAt} BETWEEN ${table.createdAt} AND ${table.expiresAt}`)
]);