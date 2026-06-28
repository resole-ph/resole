import { ticket } from '@/db/schema';
import { User } from '@/features/auth/types/types';

type InferTicket = typeof ticket.$inferSelect;
export type Ticket = Omit<InferTicket, 'userId'> & { user: User };
export type CreateTicket = typeof ticket.$inferInsert;
export type UpdateTicket = Partial<InferTicket>;