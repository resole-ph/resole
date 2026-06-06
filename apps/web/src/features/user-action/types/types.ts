import { referal, rating, save } from '@/db/schema';
import { User } from '@/features/auth/types/types';
import { ShoeListing } from '@/features/shoe/types/types';

type InferReferal = typeof referal.$inferSelect;
export type Referal = Omit<InferReferal, 'referedById' | 'referedToId'> & { referedBy: User, referedTo: User };
export type CreateReferal = typeof referal.$inferInsert;
export type UpdateReferal = Partial<InferReferal>; 

type InferRating = typeof rating.$inferSelect;
export type Rating = Omit<InferRating, 'raterId' | 'rateeId'> & { rater: User, ratee: User };
export type CreateRating = typeof rating.$inferInsert;
export type UpdateRating = Partial<InferReferal>;

type InferSave = typeof save.$inferSelect;
export type Save = Omit<InferSave, 'listingId' | 'userId'> & { listing: ShoeListing, user: User };
export type CreateSave = typeof save.$inferInsert;
export type UpdateSave = Partial<InferReferal>;