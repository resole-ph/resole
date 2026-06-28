import { conversation, message } from '@/db/schema';

export type Conversation = typeof conversation.$inferSelect;
export type CreateConversation = typeof conversation.$inferInsert;
export type UpdateConversation = Partial<Conversation>;

export type Message = typeof message.$inferSelect;
export type CreateMessage = typeof message.$inferInsert;
export type UpdateMessage = Partial<Message>;