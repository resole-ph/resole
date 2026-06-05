import { create } from 'zustand';
import type { Listing } from '@/components/molecules/ListingCard';

export interface CartItem {
  listing: Listing;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (listing: Listing) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],

  addItem: (listing) =>
    set((s) => {
      const existing = s.items.find((i) => i.listing.id === listing.id);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.listing.id === listing.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...s.items, { listing, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.listing.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((s) => ({
      items:
        quantity <= 0
          ? s.items.filter((i) => i.listing.id !== id)
          : s.items.map((i) =>
              i.listing.id === id ? { ...i, quantity } : i,
            ),
    })),

  clearCart: () => set({ items: [] }),
}));
