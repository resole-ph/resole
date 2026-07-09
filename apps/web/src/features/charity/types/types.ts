import { charity } from '@/db/schema';

export type Charity = typeof charity.$inferSelect;
export type CreateCharity = typeof charity.$inferInsert;
export type UpdateCharity = Partial<Charity>;