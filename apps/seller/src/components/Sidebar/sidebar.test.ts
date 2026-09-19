import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, isSidebarItemActive } from './Sidebar';

describe('Seller Sidebar Navigation', () => {
  it('contains all 10 required seller navigation items', () => {
    expect(NAV_ITEMS.length).toBe(10);

    const labels = NAV_ITEMS.map((i) => i.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Products');
    expect(labels).toContain('Inventory Stock');
    expect(labels).toContain('Orders & Shipments');
    expect(labels).toContain('Customers');
    expect(labels).toContain('Customer Reviews');
    expect(labels).toContain('Contact Enquiries');
    expect(labels).toContain('Store Content CMS');
    expect(labels).toContain('Promo Discounts');
    expect(labels).toContain('Store Settings');
  });

  it('matches Dashboard only on exact root pathname', () => {
    const dashboardItem = NAV_ITEMS.find((i) => i.href === '/')!;
    expect(dashboardItem.exact).toBe(true);

    expect(isSidebarItemActive(dashboardItem, '/')).toBe(true);
    expect(isSidebarItemActive(dashboardItem, '/products')).toBe(false);
    expect(isSidebarItemActive(dashboardItem, '/orders/123')).toBe(false);
  });

  it('matches section routes and their nested child paths by prefix', () => {
    const productsItem = NAV_ITEMS.find((i) => i.href === '/products')!;
    expect(isSidebarItemActive(productsItem, '/products')).toBe(true);
    expect(isSidebarItemActive(productsItem, '/products/new')).toBe(true);
    expect(isSidebarItemActive(productsItem, '/products/candle-123/edit')).toBe(true);
    expect(isSidebarItemActive(productsItem, '/inventory')).toBe(false);

    const ordersItem = NAV_ITEMS.find((i) => i.href === '/orders')!;
    expect(isSidebarItemActive(ordersItem, '/orders')).toBe(true);
    expect(isSidebarItemActive(ordersItem, '/orders/ord_456')).toBe(true);
    expect(isSidebarItemActive(ordersItem, '/customers')).toBe(false);
  });
});
