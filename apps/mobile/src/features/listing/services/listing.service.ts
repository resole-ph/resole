import { Listing } from '@/components/molecules/ListingCard';
import { FavItem } from '../types/listing.types';
import { apiFetch } from '@/lib/api-client';

export const ListingService = {
  async getSimilarListings(model: string): Promise<Listing[]> {
    const res = await apiFetch<Listing[]>(`/api/listings/search?query=${model}`, {
      method: 'GET'
    });

    return res;
  },
  
  async getListingById(id: number): Promise<Listing> {
    const res = await apiFetch<Listing>(`/api/listings/${id}`, {
      method: 'GET'
    });

    return res;
  },

  async getUserListings(): Promise<Listing[]> {
    const res = await apiFetch<Listing[]>(`/api/users/me/listings`, {
      method: 'GET'
    });

    return res;
  },

  async getUserFavourites(): Promise<FavItem[]> {
    const res = await apiFetch<any>(`/api/users/me/favourites`, {
      method: 'GET'
    });

    return res.map((item: any) => { 
      let details = item.details;
      return { ...details, saved: true };
    });
  },

  async getSwapListings(): Promise<Listing[]> {
    const res = await apiFetch<Listing[]>(`/api/listings?section=swap-board`, {
      method: 'GET'
    });

    return res;
  },

  async getSaleListings(): Promise<Listing[]> {
    const res = await apiFetch<Listing[]>(`/api/listings?section=swap-board`, {
      method: 'GET'
    });

    return res;
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