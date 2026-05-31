import { 
  pgTable,
  pgEnum, 
  text, 
  timestamp, 
  boolean,
  integer,
  numeric,
  serial,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';
import { shoeListing } from './shoe.schema';
import { charity } from './charity.schema';

export const transactionEnum = pgEnum('transaction_enum', [
  'sale',
  'swap',
  'donate'
]);

export const transaction = pgTable('transaction', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .notNull()
    .references(() => shoeListing.id),
  recipientId: text('recipient_id')
    .references(() => user.id),
  type: transactionEnum('type').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  coinsEarned: integer('coins_earned').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
}, (table) => [
  check('coins_earned_check', sql`${table.coinsEarned} > 0`),
]);

export const sale = pgTable('sale', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id, { onDelete: 'cascade' }),
  price: numeric('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('price_check', sql`${table.price} > 0`)
]);

export const redemption = pgTable('redemption', {
  id: serial('id').primaryKey(),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sale.id, { onDelete: 'cascade' }),
  coinsRedeemed: integer('coins_redeemed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('coins_redeemed_check', sql`${table.coinsRedeemed} > 0`)
]);

export const swap = pgTable('swap', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const swapItem = pgTable('swap_item', {
  id: serial('id').primaryKey(),
  swapId: integer('swap_id')
    .notNull()
    .references(() => swap.id, { onDelete: 'cascade' }),
  swapItemId: integer('swap_item_id')
    .notNull()
    .references(() => shoeListing.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const donation = pgTable('donation', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id, { onDelete: 'cascade' }),
  charityId: integer('charity_id')
    .notNull()
    .references(() => charity.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  pickupDate: timestamp('pickup_date'),
  shippedDate: timestamp('shipped_date')
}, (table) => [
  check('pickup_date_check', sql`${table.pickupDate} > ${table.createdAt}`),
  check('shipped_date_check', sql`${table.shippedDate} > ${table.pickupDate}`)
]);