'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  itemCount: number;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, qty: 1 }],
          }));
        }
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },
    }),
    { name: 'meadow-mist-cart' }
  )
);
