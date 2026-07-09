import { 
  pgTable, 
  text, 
  timestamp, 
  integer,
  serial,
  check,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';
import { shoeListing } from './shoe.schema';

export const cartItem = pgTable('cart_item', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  listingId: integer('listing_id')
    .notNull()
    .references(() => shoeListing.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(1).notNull(),
  isBuyNow: boolean('is_buy_now').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  check('quantity_check', sql`${table.quantity} > 0`),
]);
