import {
  boolean,
  index,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const notificationCategoryEnum = pgEnum('notification_category_enum', [
  'listing',
  'offer',
  'promotion',
  'system',
]);

export const notification = pgTable('notification', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  category: notificationCategoryEnum('category').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  actionUrl: text('action_url'),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  isRead: boolean('is_read').default(false).notNull(),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}, (table) => [
  index('notification_user_id_created_at_idx').on(table.userId, table.createdAt),
]);

export const notificationDevice = pgTable('notification_device', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expoPushToken: text('expo_push_token').notNull().unique(),
  platform: text('platform'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  disabledAt: timestamp('disabled_at'),
}, (table) => [
  index('notification_device_user_id_idx').on(table.userId),
]);