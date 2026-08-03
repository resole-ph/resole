import type { Listing } from '@/components/molecules/ListingCard';

export type FavItem = {
  id: number;
  listingId: number;
  model: string;
  brand: string;
  size: string;
  price?: string;
  colorway: string;
  savedAt: Date;
  saved: boolean;
  imageUrl?: string;
};

export type SortOption = 'newest' | 'oldest' | 'price_low' | 'price_high';

export interface MarketFilters {
  sizes: string[];
  colors: string[];
  conditions: Listing['condition'][];
  minRating: number | null;
  priceMin: string;
  priceMax: string;
}

export type OwnedListingQuery = MarketFilters & {
  sort: SortOption;
};
