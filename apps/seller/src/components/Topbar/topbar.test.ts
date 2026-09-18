import { describe, it, expect } from 'vitest';
import { getSellerPageTitle, PAGE_TITLES } from './Topbar';

describe('Seller Topbar Page Title Resolution', () => {
  it('resolves standard mapped page titles correctly', () => {
    Object.entries(PAGE_TITLES).forEach(([route, expectedTitle]) => {
      expect(getSellerPageTitle(route)).toBe(expectedTitle);
    });
  });

  it('resolves dynamic order detail routes', () => {
    expect(getSellerPageTitle('/orders/ord_9999')).toBe('Order Details');
    expect(getSellerPageTitle('/orders/12345/fulfillment')).toBe('Order Details');
  });

  it('resolves dynamic product edit routes', () => {
    expect(getSellerPageTitle('/products/amber-candle-123/edit')).toBe('Edit Product');
    expect(getSellerPageTitle('/products/ceramic-pot/edit')).toBe('Edit Product');
  });

  it('returns fallback title for unknown or arbitrary routes', () => {
    expect(getSellerPageTitle('/unknown-route')).toBe('Seller Management');
    expect(getSellerPageTitle('/reports/custom')).toBe('Seller Management');
  });
});
