import { 
  pgTable,
  pgEnum,
  text, 
  timestamp, 
  uuid,
  integer,
  index
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { transaction } from './transaction.schema';

export const ticketStatusEnum = pgEnum('ticket_status_enum', [
  'open', 
  'in_progress', 
  'resolved', 
  'closed'
]);

export const ticketPriorityEnum = pgEnum('ticket_priority_enum', [
  'low',
  'medium',
  'high',
  'urgent'
]);

export const ticket = pgTable('ticket', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  issue: text('issue').notNull(),
  description: text('description').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  priority: ticketPriorityEnum('priority').default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
}, (table) => [
  index('ticket_user_id_idx').on(table.userId),
  index('ticket_transaction_id_idx').on(table.transactionId),
  index('ticket_status_idx').on(table.status),
]);