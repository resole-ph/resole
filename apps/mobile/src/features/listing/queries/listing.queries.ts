import { useQuery } from '@tanstack/react-query';
import { ListingService, type ListingFilters } from '../services/listing.service';

export const listingKeys = {
  all: ['listings'] as const,
  browse: (filters?: ListingFilters) =>
    [...listingKeys.all, 'browse', filters?.brand ?? 'all', filters?.search ?? ''] as const,
  sale: (filters?: ListingFilters) =>
    [...listingKeys.all, 'sale', filters?.brand ?? 'all', filters?.search ?? ''] as const,
  swap: (filters?: ListingFilters) =>
    [...listingKeys.all, 'swap', filters?.brand ?? 'all', filters?.search ?? ''] as const,
  favouriteIds: () => [...listingKeys.all, 'favourite-ids'] as const,
};

/**
 * Keyed by filter, so switching brands and switching back is a cache hit
 * rather than another pair of requests.
 */
export function useSaleListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: listingKeys.sale(filters),
    queryFn: () => ListingService.getSaleListings(filters),
    placeholderData: (prev) => prev,
  });
}

export function useSwapListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: listingKeys.swap(filters),
    queryFn: () => ListingService.getSwapListings(filters),
    placeholderData: (prev) => prev,
  });
}

/**
 * The generic browse list BrowseFeed self-fetches when it has no `listings`
 * prop. `enabled` is false in controlled mode, where the parent supplies them.
 */
export function useBrowseListings(filters: ListingFilters, enabled = true) {
  return useQuery({
    queryKey: listingKeys.browse(filters),
    queryFn: () => ListingService.getListings(filters),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useFavouriteListingIds() {
  return useQuery({
    queryKey: listingKeys.favouriteIds(),
    queryFn: () => ListingService.getFavouriteListingIds(),
  });
}
