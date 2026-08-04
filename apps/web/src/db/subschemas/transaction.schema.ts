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
  index,
  jsonb
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

export const voucherEnum = pgEnum('voucher_enum', [
  'percent_off',
  'price_off',
  'free_coins',
  'donation',
  'boost',
  'other'
])

export const transaction = pgTable('transaction', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .references(() => shoeListing.id, { onDelete: 'set null' }),
  listingSnapshot: jsonb('listing_snapshot').$type<Record<string, unknown>>(),
  recipientId: text('recipient_id')
    .references(() => user.id),
  type: transactionEnum('type').notNull(),
  isAccepted: boolean('is_accepted'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  coinsEarned: integer('coins_earned'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  acceptedAt: timestamp('accepted_at'),
  completedAt: timestamp('completed_at')
}, (table) => [
  check('coins_earned_check', sql`${table.coinsEarned} > 0`),
  index('transaction_listing_id_idx').on(table.listingId),
  index('transaction_recipient_id_idx').on(table.recipientId)
]);

export const trackingEvent = pgTable('tracking_event', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('tracking_event_transaction_id_idx').on(table.transactionId)
]);

export const sale = pgTable('sale', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id, { onDelete: 'cascade' }),
  price: numeric('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('price_check', sql`${table.price} > 0`),
  index('sale_transaction_id_idx').on(table.transactionId)
]);

export const redemption = pgTable('redemption', {
  id: serial('id').primaryKey(),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sale.id, { onDelete: 'cascade' }),
  coinsRedeemed: integer('coins_redeemed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('coins_redeemed_check', sql`${table.coinsRedeemed} > 0`),
  index('redemption_sale_id_idx').on(table.saleId),
]);

export const swap = pgTable('swap', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id')
    .notNull()
    .references(() => transaction.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('swap_transaction_id_idx').on(table.transactionId)
]);

export const swapItem = pgTable('swap_item', {
  id: serial('id').primaryKey(),
  swapId: integer('swap_id')
    .notNull()
    .references(() => swap.id, { onDelete: 'cascade' }),
  itemId: integer('swap_item_id')
    .references(() => shoeListing.id, { onDelete: 'set null' }),
  listingSnapshot: jsonb('listing_snapshot').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('swap_item_swap_id_idx').on(table.swapId),
  index('swap_item_item_id_idx').on(table.itemId),
]);

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
    .notNull()
}, (table) => [
  index('donation_transaction_id_idx').on(table.transactionId),
  index('donation_charity_id_idx').on(table.charityId)
]);

export const voucher = pgTable('voucher', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  amount: numeric('amount'),
  voucherType: voucherEnum('voucher_type').default('other').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull()
}, (table) => [
  index('voucher_pkey').on(table.id)
]);

export const voucherRedeem = pgTable('voucher_redeem', {
  id: serial('id').primaryKey(),
  voucherId: integer('voucher_id')
    .notNull()
    .references(() => voucher.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  redeemedAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  index('voucher_redeem_user_id_idx').on(table.userId)
]);
