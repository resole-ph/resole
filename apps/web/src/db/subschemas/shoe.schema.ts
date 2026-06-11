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
  unique,
  vector,
  index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';

export const categoryEnum = pgEnum('caetgory_enum', [
  'running',
  'basketball',
  'football',
  'casual',
  'other'
]);

export const listingEnum = pgEnum('listing_enum', [
  'sale',
  'swap',
  'both'
]);

export const shoe = pgTable('shoe', {
  id: serial('id').primaryKey(),
  model: text('model').notNull(),
  brand: text('brand').notNull(),
  category: categoryEnum('category').default('other').notNull(),
  co2Footprint: numeric('co2_footprint').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull()
}, (table) => [
  check('co2_footprint_check', sql`(${table.co2Footprint} >= 0)`),
  unique('shoe_model_brand_unique').on(table.model, table.brand),
  index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops'))
]);

export const shoePrice = pgTable('shoe_price', {
  id: serial('id').primaryKey(),
  shoeId: integer('shoe_id')
    .notNull()
    .references(() => shoe.id, { onDelete: 'cascade' }),
  price: numeric('price').notNull(),
  source: text('source'),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
}, (table) => [
  check('price_check', sql`${table.price} > 0`)
]);

export const shoeListing = pgTable('shoe_listing', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  shoeId: integer('shoe_id')
    .notNull()
    .references(() => shoe.id, { onDelete: 'cascade' }),
  value: numeric('value').notNull(),
  description: text('description'),
  colorway: text('colorway').notNull(),
  size: numeric('size').notNull(),
  conditionScore: numeric('condition_score').notNull(),
  defects: text('defects').array(),
  isRefurbished: boolean('is_refurbished').default(false).notNull(),
  listingMode: listingEnum('listing_mode').default('both').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  imageUrlTop: text('image_url_top').notNull(),
  imageUrlSide: text('image_url_side').notNull(),
  imageUrlSole: text('image_url_sole').notNull(),
  imageUrlInsole: text('image_url_insole').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
}, (table) => [
  check('value_check', sql`${table.value} > 0`),
  check('size_check', sql`${table.size} > 0`),
  check('condition_score_check', sql`${table.conditionScore} > 0`),
]);