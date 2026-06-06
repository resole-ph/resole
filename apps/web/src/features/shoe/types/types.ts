import { shoe, shoePrice, shoeListing, user } from '@/db/schema';
import { User } from '@/features/auth/types/types';

export type Shoe = typeof shoe.$inferSelect;
export type CreateShoe = typeof shoe.$inferInsert;
export type UpdateShoe = Partial<Shoe>;

type InferShoePrice = typeof shoePrice.$inferSelect;
export type ShoePrice = Omit<InferShoePrice, 'shoeId'> & { shoe: Shoe };
export type CreateShoePrice = typeof shoePrice.$inferInsert;
export type UpdateShoePrice = Partial<InferShoePrice>;

type InferShoeListing = typeof shoeListing.$inferSelect;
export type ShoeListing = Omit<InferShoeListing, 'shoeId' | 'userId'> & { shoe: Shoe, user: User };
export type CreateShoeListing = typeof shoeListing.$inferInsert;
export type UpdateShoeListing = Partial<InferShoeListing>;