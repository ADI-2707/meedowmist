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
  category?: 'candle' | 'ceramic';
  selectedFragrance?: string;
  selectedColor?: string;
  selectedSize?: string;
  customNotes?: string;
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
  inFlightItemIds: string[];
  isDrawerOpen: boolean;
  toast: ToastInfo | null;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  clearToast: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  isItemInFlight: (productId: string) => boolean;
  setInFlight: (productId: string, inFlight: boolean) => void;
  itemCount: number;
  total: number;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      inFlightItemIds: [],
      isDrawerOpen: false,
      toast: null,

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        let updatedItems: CartItem[];
        if (existing) {
          updatedItems = get().items.map((i) =>
            i.productId === item.productId
              ? {
                  ...i,
                  qty: i.qty + 1,
                  selectedFragrance: item.selectedFragrance ?? i.selectedFragrance,
                  selectedColor: item.selectedColor ?? i.selectedColor,
                  selectedSize: item.selectedSize ?? i.selectedSize,
                  customNotes: item.customNotes ?? i.customNotes,
                }
              : i
          );
        } else {
          updatedItems = [...get().items, { ...item, qty: 1 }];
        }

        const showViewBag = !get().isDrawerOpen;
        set({
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, i) => sum + i.qty, 0),
          total: updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0),
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
        const updatedItems = get().items.filter((i) => i.productId !== productId);
        set({
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, i) => sum + i.qty, 0),
          total: updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0),
        });

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
        const updatedItems = get().items.map((i) => (i.productId === productId ? { ...i, qty } : i));
        set({
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, i) => sum + i.qty, 0),
          total: updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0),
        });

        if (toastTimer) {
          clearTimeout(toastTimer);
        }

        const showViewBag = !get().isDrawerOpen;
        toastTimer = setTimeout(() => {
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
        }, 150);
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
      clearToast: () => set({ toast: null }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false, toast: null }),

      isItemInFlight: (productId: string) => (get().inFlightItemIds || []).includes(productId),

      setInFlight: (productId: string, inFlight: boolean) => {
        const current = get().inFlightItemIds || [];
        set({
          inFlightItemIds: inFlight
            ? [...new Set([...current, productId])]
            : current.filter((id) => id !== productId),
        });
      },

      itemCount: 0,
      total: 0,
    }),
    {
      name: 'meadow-mist-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
