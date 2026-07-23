import { 
    pgTable, 
    pgEnum,
    text, 
    timestamp, 
    boolean, 
    integer,
    serial,
    uniqueIndex
} from 'drizzle-orm/pg-core';

export const intentEnum = pgEnum('intent_enum', [
  'buy', 
  'sell', 
  'donate'
]);

export const unitEnum = pgEnum('unit_enum', [
  'us',
  'uk',
  'eu',
  'au',
  'mx',
  'mm',
  'cm',
  'in',
]);

export const classificaitonEnum = pgEnum('classification_enum', [
  'men',
  'women',
  'children'
])

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  address: text('address'),
  city: text('city'),
  contactNo: text('contact_no'),
  description: text('description').default('I love shoes!'),
  coins: integer('coins').default(0).notNull(),
  intent: intentEnum('intent').default('buy').notNull(),
  unit: unitEnum('unit').default('us'),
  classificaiton: classificaitonEnum('classification').default('men'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  expiresAt: timestamp('expires_at').notNull()
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
}, (table) => [
  uniqueIndex('account_provider_id_account_id_unique').on(table.providerId, table.accountId),
]);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  expiresAt: timestamp('expires_at').notNull()
});

export const login = pgTable('login', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});