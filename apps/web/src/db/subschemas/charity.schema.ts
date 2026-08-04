import { 
  pgTable,
  pgEnum,
  text, 
  timestamp, 
  serial,
} from 'drizzle-orm/pg-core';

export const causeEnum = pgEnum('cause_enum', [
  'Community building',
  'Disaster relief',
  'Environment & wildlife',
  'Children\'s welfare',
  'Poverty alleviation',
  'Child education',
  'Other'
])

export const charity = pgTable('charity', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  description: text('description').notNull(),
  image: text('image'),
  cause: causeEnum('cause').default('Other').notNull(),
  coordinator: text('coordinator').notNull(),
  email: text('email').notNull(),
  contactNo: text('contact_no').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  deletedAt: timestamp('deleted_at')
});
