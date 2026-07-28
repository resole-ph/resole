import type { SerializedShoeListing } from '@/features/shoe/utils/listing-dto';

/** The signed-in user's own profile, as returned by `/api/users/me`. */
export type MyProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  location: string | null;
  contactNo: string | null;
  coins: number;
  overallRating: number;
  reviewCount: number;
  joinedYear: number;
};

export type UserStats = {
  pairsSaved: number;
  coinBalance: number;
  loginStreak: number;
  listingCount: number;
  salesCount: number;
  swapsCount: number;
};

/** Another user's profile — no contact details, no account settings. */
export type PublicProfile = {
  id: string;
  name: string;
  image: string | null;
  description: string | null;
  location: string | null;
  overallRating: number;
  reviewCount: number;
  joinedYear: number;
  listingCount: number;
  salesCount: number;
  swapsCount: number;
};

export type ListingSummary = {
  total: number;
  active: number;
  unavailable: number;
};

export type FavouriteItem = {
  details: { id: number; model: string; brand: string };
  listing: { id: number; imageUrlTop: string | null };
};

export type ProfileListing = SerializedShoeListing;

export type PublicProfileTab = 'reviews' | 'listings';

export type UserReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  rater: { id: string; name: string; image: string | null };
};
