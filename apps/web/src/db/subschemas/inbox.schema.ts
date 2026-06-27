import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';
import { transaction } from './transaction.schema';

export const conversation = pgTable('conversation', {
  id: serial('id').primaryKey(),
  listerId: text('lister_id')
    .notNull()
    .references(() => user.id),
  recipientId: text('recipient_id')
    .notNull()
    .references(() => user.id),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
});

export const message = pgTable('message', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  conversationId: integer('conversation_id')
    .notNull()
    .references(() => conversation.id),
  replyTo: integer('reply_to').references((): AnyPgColumn => message.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  isEdited: boolean('is_edited').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
});