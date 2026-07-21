import { Listing } from '@/components/molecules/ListingCard';
import { FavItem } from '../types/listing.types';
import { apiFetch } from '@/lib/api-client';

export interface ListingFilters {
  brand?: string;
  search?: string;
}

function buildListingQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const ListingService = {
  getDaysLeft(date: Date | string): number {
    const LISTING_DURATION_DAYS = 30;
    const now = new Date().getTime();
    const listing = new Date(date).getTime();
    const daysElapsed = (now - listing) / (1000 * 60 * 60 * 24);
    return Math.max(Math.round(LISTING_DURATION_DAYS - daysElapsed), 0);
  },

  async getListings(filters?: ListingFilters): Promise<Listing[]> {
    const query = buildListingQuery({ brand: filters?.brand, search: filters?.search });
    const res = await apiFetch<{ shoeListings: Listing[] }>(`/api/listings${query}`, {
      method: 'GET'
    });

    return res.shoeListings;
  },

  async getSimilarListings(model: string): Promise<Listing[]> {
    const res = await apiFetch<{ shoeSearch: Listing[] }>(`/api/listings/search?query=${model}`, {
      method: 'GET'
    });

    return res.shoeSearch;
  },
  
  async getListingById(id: number): Promise<Listing> {
    const res = await apiFetch<{ shoeListing: Listing }>(`/api/listings/${id}`, {
      method: 'GET'
    });

    return res.shoeListing;
  },

  async getUserListings(): Promise<Listing[]> {
    const res = await apiFetch<{ shoeListings: Listing[] }>(`/api/users/me/listings`, {
      method: 'GET'
    });

    return res.shoeListings;
  },

  async getUserFavourites(): Promise<FavItem[]> {
    const res = await apiFetch<{ favourites: any[] }>(`/api/users/me/favourites`, {
      method: 'GET'
    });

    return res.favourites.map((item: any) => {
      const details = item.details;
      return { ...details, listingId: item.listing?.id, saved: true, imageUrl: item.listing?.imageUrlTop };
    });
  },

  async getSwapListings(filters?: ListingFilters): Promise<Listing[]> {
    const query = buildListingQuery({ section: 'swap-board', brand: filters?.brand, search: filters?.search });
    const res = await apiFetch<{ shoeListings: Listing[] }>(`/api/listings${query}`, {
      method: 'GET'
    });

    return res.shoeListings;
  },

  async getSaleListings(filters?: ListingFilters): Promise<Listing[]> {
    const query = buildListingQuery({ section: 'sale-board', brand: filters?.brand, search: filters?.search });
    const res = await apiFetch<{ shoeListings: Listing[] }>(`/api/listings${query}`, {
      method: 'GET'
    });

    return res.shoeListings;
  },

  async getFavouriteListingIds(): Promise<number[]> {
    const favourites = await this.getUserFavourites();
    return favourites.map((item) => item.listingId).filter((id): id is number => id != null);
  },

  async favouriteListing(id: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}/save`, {
      method: 'POST'
    });
  },

  async unfavouriteListing(id: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}/save`, {
      method: 'DELETE'
    });
  },

  async deleteListing(id: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}`, {
      method: 'DELETE'
    });
  },

  async relistListing(id: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}`, {
      method: 'PATCH',
      body: { isAvailable: true },
    });
  },

  async donateListing(id: number, charityId: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}/donate`, {
      method: 'POST',
      body: { charityId },
    });
  }
}