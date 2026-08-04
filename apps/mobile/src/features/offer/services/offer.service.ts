import { apiFetch } from '@/lib/api-client';

export type ExistingListingOffer = {
  transactionId: number;
  type: 'sale' | 'swap' | 'donate';
  conversationId: number;
};

export const OfferService = {
  async getExistingForListing(id: number): Promise<ExistingListingOffer | null> {
    const { offer } = await apiFetch<{ offer: ExistingListingOffer | null }>(
      `api/listings/${id}/offer`,
      { method: 'GET' },
    );

    return offer;
  },

  async createSwap(id: number, listings: number[], message: string) {
    const transaction = await apiFetch<any>(`api/listings/${id}/swap-offers`, {
      method: 'POST',
      body: {
        'type': 'swap',
        listings: listings
      }
    });

    const messagePayload = {
      listerId: transaction.transactionDetails.listing.userId,
      transactionId: transaction.transactionDetails.id,
      content: message
    };

    const inbox = await apiFetch<any>(`api/conversations`, {
      method: 'POST',
      body: messagePayload
    });

    return {
      transaction: transaction,
      inbox: inbox
    };
  },

  async createSale(id: number, price: number, message: string) {
    const transaction = await apiFetch<any>(`api/listings/${id}/sale-offers`, {
      method: 'POST',
      body: {
        'type': 'sale',
        price: price
      }
    });

    const messagePayload = {
      listerId: transaction.transactionDetails.listing.userId,
      transactionId: transaction.transactionDetails.id,
      content: message
    };

    const inbox = await apiFetch<any>(`api/conversations`, {
      method: 'POST',
      body: messagePayload
    });

    return {
      transaction: transaction,
      inbox: inbox
    };
  },

  async acceptOffer(transactionId: number) {
    return apiFetch<{ message: string }>(`api/offers/${transactionId}/accept`, {
      method: 'POST',
    });
  },

  async declineOffer(transactionId: number) {
    return apiFetch<{ message: string }>(`api/offers/${transactionId}/decline`, {
      method: 'POST',
    });
  },

  async editOffer(transactionId: number, payload: { price: number } | { listings: number[] }) {
    return apiFetch<{ message: string; details: any }>(`api/offers/${transactionId}`, {
      method: 'PATCH',
      body: payload,
    });
  },
}
