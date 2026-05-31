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
import { shoeListing } from './shoe.schema';

export const referalEnum = pgEnum('referal_enum', [
  'facebook',
  'messenger',
  'x',
  'instagram',
  'code',
  'other'
]);

export const referal = pgTable('referal', {
  id: serial('id').primaryKey(),
  referedById: text('refered_by_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  referedToId: text('refered_to_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  method: referalEnum('method').default('other').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  check('referal_id_check', sql`${table.referedById} != ${table.referedToId}`)
]);

export const rating = pgTable('rating', {
  id: serial('id').primaryKey(),
  raterId: text('rater_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rateeId: text('ratee_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
}, (table) => [
  check('rating_id_check', sql`${table.raterId} != ${table.rateeId}`),
  check('rating_check', sql`${table.rating} BETWEEN 0 AND 5`)
]);

export const save = pgTable('save', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .notNull()
    .references(() => shoeListing.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  removedAt: timestamp('removed_at')
});