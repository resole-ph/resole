import { Listing } from '@/components/molecules/ListingCard';
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
  }
}