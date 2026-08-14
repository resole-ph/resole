import { apiFetch } from '@/lib/api-client';

export type ExistingListingOffer = {
  transactionId: number;
  type: 'sale' | 'swap' | 'donate';
  conversationId: number;
};

/** One offer received on your own listing, with the buyer behind it. */
export type ReceivedListingOffer = {
  transactionId: number;
  /**
   * The seller's thread with this buyer — what "Open chat" jumps to. Null when
   * the pair has no thread yet, which is the case for every offer made from web.
   */
  conversationId: number | null;
  type: 'sale' | 'swap' | 'donate';
  /** null while pending, true accepted, false declined. */
  isAccepted: boolean | null;
  isCompleted: boolean;
  createdAt: string;
  /** Sale offers only; a swap's value is the items put up instead. */
  price: number | null;
  swapItemCount: number;
  buyer: {
    id: string;
    name: string;
    location: string | null;
    rating: number | null;
  };
};

export const OfferService = {
  async getExistingForListing(id: number): Promise<ExistingListingOffer | null> {
    const { offer } = await apiFetch<{ offer: ExistingListingOffer | null }>(
      `api/listings/${id}/offer`,
      { method: 'GET' },
    );

    return offer;
  },

  /**
   * Offers received on a listing you own. The API rejects this with a 403 for
   * anyone else, so only call it once the listing is known to be yours.
   */
  async getReceivedForListing(id: number): Promise<ReceivedListingOffer[]> {
    const { offers } = await apiFetch<{ offers: ReceivedListingOffer[] }>(
      `api/listings/${id}/offers`,
      { method: 'GET' },
    );

    return offers ?? [];
  },

  async createSwap(id: number, listings: number[], topUp: number, message: string) {
    const transaction = await apiFetch<any>(`api/listings/${id}/swap-offers`, {
      method: 'POST',
      body: {
        'type': 'swap',
        listings: listings,
        topUp: topUp
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

  async editOffer(transactionId: number, payload: { price: number } | { listings: number[]; topUp: number }) {
    return apiFetch<{ message: string; details: any }>(`api/offers/${transactionId}`, {
      method: 'PATCH',
      body: payload,
    });
  },
}
