import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  index,
  check,
  jsonb,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { transaction } from './transaction.schema';
import { sql } from 'drizzle-orm';

export type MessageAttachment = {
  type: 'image';
  path: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  fileName: string;
};

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
}, (table) => [
  check('conversation_user_check', sql`${table.listerId} != ${table.recipientId}`),
  index('conversation_lister_id_idx').on(table.listerId),
  index('conversation_recipient_id_idx').on(table.recipientId),
  index('conversation_transaction_id_idx').on(table.transactionId),
]);

export const message = pgTable('message', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  conversationId: integer('conversation_id')
    .notNull()
    .references(() => conversation.id),
  transactionId: integer('transaction_id')
    .references(() => transaction.id),
  replyTo: integer('reply_to').references((): AnyPgColumn => message.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  attachment: jsonb('attachment').$type<MessageAttachment>(),
  isEdited: boolean('is_edited').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
}, (table) => [
  check('message_reply_check', sql`${table.id} != ${table.replyTo}`),
  check('message_content_or_attachment_check', sql`length(trim(${table.content})) > 0 OR ${table.attachment} IS NOT NULL`),
  index('message_user_id_idx').on(table.userId),
  index('message_conversation_id_idx').on(table.conversationId),
  index('message_transaction_id_idx').on(table.transactionId),
]);
