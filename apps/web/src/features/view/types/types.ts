import { listingView } from '@/db/schema';
import { profileView } from '@/db/schema';

export type ListingView = typeof listingView.$inferSelect;
export type CreateListingView = typeof listingView.$inferInsert;

export type ProfileView = typeof profileView.$inferSelect;
export type CreateProfileView = typeof profileView.$inferInsert;