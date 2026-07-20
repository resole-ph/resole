import {
  pgTable,
  serial,
  timestamp,
  integer,
  index,
  text,
  check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { user } from './auth.schema';
import { shoeListing } from './shoe.schema';

export const listingView = pgTable('listing_view', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id')
    .notNull()
    .references(() => shoeListing.id),
  viewerId: text('viewer_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('listing_view_listing_id_idx').on(table.listingId),
  index('listing_view_viewer_id_idx').on(table.viewerId),
]);

export const profileView = pgTable('profile_view', {
  id: serial('id').primaryKey(),
  profileUserId: text('profile_user_id')
    .notNull()
    .references(() => user.id),
  viewerId: text('viewer_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('profile_view_profile_user_id_idx').on(table.profileUserId),
  index('profile_view_viewer_id_idx').on(table.viewerId),
  check('profile_view_self_check', sql`${table.profileUserId} != ${table.viewerId}`), 
]);