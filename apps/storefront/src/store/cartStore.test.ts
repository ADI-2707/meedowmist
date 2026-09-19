import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore, CartItem } from './cartStore';

describe('Storefront Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().clearToast();
    useCartStore.getState().closeDrawer();
  });

  const mockItem: Omit<CartItem, 'qty'> = {
    productId: 'prod_candle_1',
    slug: 'amber-moss-candle',
    name: 'Amber & Moss Candle',
    price: 899,
    image: '/images/products/amber-moss.jpg',
    category: 'candle',
    selectedFragrance: 'Amber Moss',
    selectedSize: '250g',
  };

  it('initializes with empty state', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.itemCount).toBe(0);
    expect(state.total).toBe(0);
    expect(state.isDrawerOpen).toBe(false);
    expect(state.toast).toBeNull();
  });

  it('adds an item to cart and creates toast', () => {
    useCartStore.getState().addItem(mockItem);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].productId).toBe('prod_candle_1');
    expect(state.items[0].qty).toBe(1);
    expect(state.itemCount).toBe(1);
    expect(state.total).toBe(899);

    expect(state.toast).not.toBeNull();
    expect(state.toast?.name).toBe('Amber & Moss Candle');
    expect(state.toast?.action).toBe('added');
  });

  it('increments quantity when duplicate item is added', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().addItem(mockItem);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].qty).toBe(2);
    expect(state.itemCount).toBe(2);
    expect(state.total).toBe(1798);
  });

  it('updates quantity of existing item', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQty('prod_candle_1', 4);

    const state = useCartStore.getState();
    expect(state.items[0].qty).toBe(4);
    expect(state.itemCount).toBe(4);
    expect(state.total).toBe(3596);
  });

  it('removes item if quantity updated to zero or negative', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQty('prod_candle_1', 0);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(0);
    expect(state.itemCount).toBe(0);
    expect(state.total).toBe(0);
  });

  it('removes item explicitly by productId', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().removeItem('prod_candle_1');

    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.itemCount).toBe(0);
  });

  it('calculates totals across multiple distinct products', () => {
    const item2: Omit<CartItem, 'qty'> = {
      productId: 'prod_ceramic_1',
      slug: 'lotus-ceramic-bowl',
      name: 'Lotus Ceramic Bowl',
      price: 1250,
      image: '/images/products/lotus.jpg',
      category: 'ceramic',
    };

    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().updateQty('prod_candle_1', 2);
    useCartStore.getState().addItem(item2);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(2);
    expect(state.itemCount).toBe(3);
    expect(state.total).toBe(899 * 2 + 1250);
  });

  it('manages drawer state', () => {
    useCartStore.getState().openDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(true);

    useCartStore.getState().closeDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(false);
  });

  it('clears all items and toast', () => {
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().clearCart();
    useCartStore.getState().clearToast();

    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.toast).toBeNull();
  });

  it('tracks in-flight item IDs correctly', () => {
    const store = useCartStore.getState();
    expect(store.isItemInFlight('prod_candle_1')).toBe(false);

    useCartStore.getState().setInFlight('prod_candle_1', true);
    expect(useCartStore.getState().isItemInFlight('prod_candle_1')).toBe(true);

    useCartStore.getState().setInFlight('prod_candle_1', false);
    expect(useCartStore.getState().isItemInFlight('prod_candle_1')).toBe(false);
  });

  it('debounces toast notifications on rapid quantity updates', () => {
    vi.useFakeTimers();
    useCartStore.getState().addItem(mockItem);
    useCartStore.getState().clearToast();

    useCartStore.getState().updateQty('prod_candle_1', 2);
    useCartStore.getState().updateQty('prod_candle_1', 3);
    useCartStore.getState().updateQty('prod_candle_1', 4);

    expect(useCartStore.getState().toast).toBeNull();

    vi.advanceTimersByTime(150);

    const state = useCartStore.getState();
    expect(state.toast).not.toBeNull();
    expect(state.toast?.name).toBe('Amber & Moss Candle');
    expect(state.items[0].qty).toBe(4);

    vi.useRealTimers();
  });
});

