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
  index,
  jsonb
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
  'Sale',
  'Swap',
  'Both'
]);

export const priceSourceEnum = pgEnum('price_source_enum', [
  'catalog', 
  'ai-estimate'
]);

export const shoe = pgTable('shoe', {
  id: serial('id').primaryKey(),
  model: text('model').notNull(),
  brand: text('brand').notNull(),
  category: categoryEnum('category').default('other').notNull(),
  co2Footprint: numeric('co2_footprint'),
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
  listingMode: listingEnum('listing_mode').default('Both').notNull(),
  isRefurbished: boolean('is_refurbished').default(false).notNull(),
  isFinalPrice: boolean('is_final_price').default(false).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  imageUrlTop: text('image_url_top').notNull(),
  imageUrlLeftSide: text('image_url_left_side').notNull(),
  imageUrlRightSide: text('image_url_right_side').notNull(),
  imageUrlSole: text('image_url_sole').notNull(),
  imageUrlInsole: text('image_url_insole').notNull(),
  imageUrlInsoleRight: text('image_url_insole_right'),
  imageUrlInsoleLeft: text('image_url_insole_left'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
}, (table) => [
  check('value_check', sql`${table.value} > 0`),
  // Sizes are stored as US Men's; bounds match the conversion chart in
  // src/features/shoe/utils/size-conversion.ts.
  check('size_check', sql`${table.size} >= 3 AND ${table.size} <= 16`),
  check('condition_score_check', sql`${table.conditionScore} > 0`),
]);

type PricingData = {
  baselinePrice: number | null;
  matchedShoeId: number | null;
  similarity: number | null;
  conditionScore: number;
  suggestedPrice: number;
  priceSource: 'catalog' | 'ai-estimate';
};

export const shoeAnalysis = pgTable('shoe_analysis', {
  id: serial('id').primaryKey(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  colorway: text('colorway').notNull(),
  size: text('size').notNull(),
  year: integer('year').notNull(),
  conditionScore: numeric('condition_score').notNull(),
  description: text('description').notNull(),
  defects: text('defects').array().notNull().default([]), 
  estimatedPrice: numeric('estimated_price').notNull(),
  pricing: jsonb('pricing').$type<PricingData>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});