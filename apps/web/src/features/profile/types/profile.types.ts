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

/**
 * Mirrors the row shape from getFavouriteListingsByUserId. `details` carries
 * more than the model/brand this type used to declare — size, price and
 * colorway are selected too, and the favourites grid needs them.
 */
export type FavouriteItem = {
  details: {
    id: number;
    model: string;
    brand: string;
    size: string | number | null;
    price: string | number | null;
    colorway: string | null;
    savedAt: string;
  };
  listing: { id: number; imageUrlTop: string | null };
};

export type ProfileListing = SerializedShoeListing;

/**
 * Flat row from getUserTransactionHistory. The API returns it as-is, so this
 * mirrors the select list rather than any nested domain object.
 */
export type TransactionRow = {
  id: number;
  type: 'sale' | 'swap' | 'donate';
  completedAt: string | null;
  createdAt: string;
  amount: string | null;
  coinsEarned: number | null;
  shoeBrand: string;
  shoeModel: string;
  ownerName: string | null;
  recipientName: string | null;
  charityName: string | null;
};

export type WalletTransactionRow = {
  id: number;
  type: 'sale' | 'swap' | 'donate';
  coinsEarned: number;
  createdAt: string;
  isLister: boolean;
  listing: { id: number; brand: string; model: string; colorway: string | null; value: string | null };
};

export type RedeemOptionRow = {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  voucherType: string;
  expiresAt: string;
};

/** Each metric carries a running total plus the two most recent 7-day windows. */
export type AnalyticsMetric = { total: number; thisWeek: number; lastWeek: number };

export type SellerAnalytics = {
  listingViews: AnalyticsMetric;
  profileViews: AnalyticsMetric;
  listingSaves: AnalyticsMetric;
};

export type PublicProfileTab = 'reviews' | 'listings';

export type UserReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  rater: { id: string; name: string; image: string | null };
};
