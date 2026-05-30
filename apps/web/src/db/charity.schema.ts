import { 
  pgTable,
  text, 
  timestamp, 
  serial,
} from 'drizzle-orm/pg-core';

export const charity = pgTable('charity', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  description: text('description').notNull(),
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