'use client';

import { create } from 'zustand';

interface WishlistStore {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  ids: [],

  toggle: (productId) => {
    const current = get().ids;
    if (current.includes(productId)) {
      set({ ids: current.filter((id) => id !== productId) });
    } else {
      set({ ids: [...current, productId] });
    }
  },

  has: (productId) => get().ids.includes(productId),
}));
