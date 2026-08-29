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

export interface ToastInfo {
  name: string;
  price: number;
  image: string;
  action: 'added' | 'updated' | 'removed';
  showViewBag: boolean;
  id: number;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  toast: ToastInfo | null;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  clearToast: () => void;
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
      toast: null,

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

        const showViewBag = !get().isDrawerOpen;
        set({
          toast: {
            name: item.name,
            price: item.price,
            image: item.image,
            action: 'added',
            showViewBag,
            id: Date.now(),
          },
        });
      },

      removeItem: (productId) => {
        const existing = get().items.find((i) => i.productId === productId);
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));

        if (existing) {
          const showViewBag = !get().isDrawerOpen;
          set({
            toast: {
              name: existing.name,
              price: existing.price,
              image: existing.image,
              action: 'removed',
              showViewBag,
              id: Date.now(),
            },
          });
        }
      },

      updateQty: (productId, qty) => {
        const existing = get().items.find((i) => i.productId === productId);
        if (!existing) return;

        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }

        const isIncrease = qty > existing.qty;
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        }));

        const showViewBag = !get().isDrawerOpen;
        set({
          toast: {
            name: existing.name,
            price: existing.price,
            image: existing.image,
            action: isIncrease ? 'added' : 'updated',
            showViewBag,
            id: Date.now(),
          },
        });
      },

      clearCart: () => set({ items: [] }),
      clearToast: () => set({ toast: null }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },
    }),
    {
      name: 'meadow-mist-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
