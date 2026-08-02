'use client';

import { useQuery } from '@tanstack/react-query';
import type { SerializedShoeListing } from '../utils/listing-dto';

export type ListingSection = 'sale-board' | 'swap-board';

export type ListingFilters = {
  section: ListingSection;
  brand?: string;
  search?: string;
};

export const listingKeys = {
  all: ['listings'] as const,
  list: (filters: ListingFilters) =>
    [...listingKeys.all, filters.section, filters.brand ?? 'all', filters.search ?? ''] as const,
};

function buildQuery({ section, brand, search }: ListingFilters) {
  const params = new URLSearchParams({ section });
  if (brand && brand !== 'All') params.set('brand', brand);
  if (search) params.set('search', search);
  return `/api/listings?${params.toString()}`;
}

async function fetchListings(filters: ListingFilters): Promise<SerializedShoeListing[]> {
  const response = await fetch(buildQuery(filters));
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? 'Failed to load listings');
  }

  return data?.shoeListings ?? [];
}

/**
 * Each (section, brand, search) combination gets its own cache entry, so
 * clearing a filter or going back to a previous search is instant — the market
 * page used to refetch both boards on every filter change.
 */
export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: () => fetchListings(filters),
    // Keeps the previous board on screen while a new filter loads instead of
    // flashing an empty grid — the filter change feels instant either way.
    placeholderData: (prev) => prev,
  });
}
