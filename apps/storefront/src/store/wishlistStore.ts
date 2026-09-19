'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  ids: string[];
  inFlightIds: string[];
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  isInFlight: (productId: string) => boolean;
  setIds: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      inFlightIds: [],

      toggle: async (productId: string) => {
        const inFlight = get().inFlightIds || [];
        if (inFlight.includes(productId)) {
          return;
        }

        set({ inFlightIds: [...inFlight, productId] });

        try {
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
        } finally {
          set({
            inFlightIds: (get().inFlightIds || []).filter((id) => id !== productId),
          });
        }
      },

      has: (productId: string) => (get().ids || []).includes(productId),

      isInFlight: (productId: string) => (get().inFlightIds || []).includes(productId),

      setIds: (ids: string[]) => set({ ids }),
    }),
    {
      name: 'meadow-mist-wishlist',
      partialize: (state) => ({ ids: state.ids }),
    }
  )
);
