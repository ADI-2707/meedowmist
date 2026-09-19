import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useWishlistStore } from './wishlistStore';

describe('Storefront Wishlist Store', () => {
  beforeEach(() => {
    useWishlistStore.getState().setIds([]);
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  it('initializes with empty wishlist', () => {
    const state = useWishlistStore.getState();
    expect(state.ids).toEqual([]);
    expect(state.has('prod_1')).toBe(false);
  });

  it('sets wishlist IDs manually', () => {
    useWishlistStore.getState().setIds(['prod_1', 'prod_2']);
    const state = useWishlistStore.getState();
    expect(state.ids).toEqual(['prod_1', 'prod_2']);
    expect(state.has('prod_1')).toBe(true);
    expect(state.has('prod_3')).toBe(false);
  });

  it('toggles product into wishlist when not present', async () => {
    await useWishlistStore.getState().toggle('prod_candle_1');
    const state = useWishlistStore.getState();

    expect(state.ids).toContain('prod_candle_1');
    expect(state.has('prod_candle_1')).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/api/wishlist', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ productId: 'prod_candle_1' }),
    }));
  });

  it('toggles product out of wishlist when already present', async () => {
    useWishlistStore.getState().setIds(['prod_candle_1', 'prod_candle_2']);
    await useWishlistStore.getState().toggle('prod_candle_1');
    const state = useWishlistStore.getState();

    expect(state.ids).not.toContain('prod_candle_1');
    expect(state.has('prod_candle_1')).toBe(false);
    expect(state.ids).toContain('prod_candle_2');
    expect(global.fetch).toHaveBeenCalledWith('/api/wishlist', expect.objectContaining({
      method: 'DELETE',
      body: JSON.stringify({ productId: 'prod_candle_1' }),
    }));
  });

  it('prevents concurrent toggle requests for the same product while in flight', async () => {
    let resolveFirst: (val: unknown) => void = () => {};
    const deferredFetch = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    global.fetch = vi.fn().mockReturnValue(deferredFetch);

    const firstToggle = useWishlistStore.getState().toggle('prod_spam_1');
    expect(useWishlistStore.getState().isInFlight('prod_spam_1')).toBe(true);

    const secondToggle = useWishlistStore.getState().toggle('prod_spam_1');
    await secondToggle;

    expect(global.fetch).toHaveBeenCalledTimes(1);

    resolveFirst({ ok: true, json: () => Promise.resolve({ success: true }) });
    await firstToggle;

    expect(useWishlistStore.getState().isInFlight('prod_spam_1')).toBe(false);
  });
});
