'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  ids: string[];
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  setIds: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: async (productId: string) => {
        const current = get().ids;
        const exists = current.includes(productId);

        if (exists) {
          set({ ids: current.filter((id) => id !== productId) });
          try {
            await fetch('/api/wishlist', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId }),
            });
          } catch {
          }
        } else {
          set({ ids: [...current, productId] });
          try {
            await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId }),
            });
          } catch {
          }
        }
      },

      has: (productId: string) => get().ids.includes(productId),

      setIds: (ids: string[]) => set({ ids }),
    }),
    {
      name: 'meadow-mist-wishlist',
    }
  )
);
