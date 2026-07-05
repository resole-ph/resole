import { apiFetch } from '@/lib/api-client';

export const OfferService = {
  async createSwap(id: number, listings: number[], message: string) {
    const transaction = await apiFetch<any>(`api/listings/${id}/swap-offers`, {
      method: 'POST',
      body: { 
        'type': 'Swap',
        listings: listings
      }
    });

    const messagePayload = {
      listerId: transaction.transactionDetails.listing.userId,
      transactionId: transaction.id,
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
        'type': 'Sale', 
        price: price
      }
    });

    const messagePayload = {
      listerId: transaction.transactionDetails.listing.userId,
      transactionId: transaction.id,
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
  } 
}