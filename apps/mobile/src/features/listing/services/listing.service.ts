import { Listing } from '@/components/molecules/ListingCard';
import { FavItem } from '../types/listing.types';
import { apiFetch } from '@/lib/api-client';

export const ListingService = {
  async getDaysLeft(date: Date | string): Promise<number> {
    const LISTING_DURATION_DAYS = 30;
    const now = new Date().getTime();
    const listing = new Date(date).getTime();
    const daysElapsed = (now - listing) / (1000 * 60 * 60 * 24);
    return Math.max(Math.round(LISTING_DURATION_DAYS - daysElapsed), 0);
  },
  
  async getListings(): Promise<Listing[]> {
    const res = await apiFetch<{ shoeListings: Listing[] }>(`/api/listings`, {
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
      return { ...details, saved: true, imageUrl: item.listing?.imageUrlTop };
    });
  },

  async getSwapListings(): Promise<Listing[]> {
    const res = await apiFetch<{ shoeListings: Listing[] }>(`/api/listings?section=swap-board`, {
      method: 'GET'
    });

    return res.shoeListings;
  },

  async getSaleListings(): Promise<Listing[]> {
    const res = await apiFetch<{ shoeListings: Listing[] }>(`/api/listings?section=swap-board`, {
      method: 'GET'
    });

    return res.shoeListings;
  },

  async favoriteListing(id: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}/save`, {
      method: 'POST'
    });
  },

  async unfavoriteListing(id: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}/save`, {
      method: 'DELETE'
    });
  },

  async deleteListing(id: number): Promise<undefined> {
    await apiFetch<undefined>(`/api/listings/${id}`, {
      method: 'DELETE'
    });
  }
}