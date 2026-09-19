import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar, NAV_ITEMS, isSidebarItemActive } from './Sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/products'),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt || ''} />,
}));

describe('Seller Sidebar Navigation Helpers', () => {
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

describe('Seller Sidebar Component Rendering & Interactions', () => {
  const onToggleCollapse = vi.fn();
  const onCloseMobile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand details and navigation items when expanded', () => {
    render(
      <Sidebar
        collapsed={false}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={false}
        onCloseMobile={onCloseMobile}
      />
    );

    expect(screen.getByText('Meadow Mist')).toBeDefined();
    expect(screen.getByText('Seller Portal')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Products')).toBeDefined();
    expect(screen.getByText('Orders & Shipments')).toBeDefined();
  });

  it('renders collapse toggle button with "Collapse sidebar" aria-label when expanded and toggles on click', () => {
    render(
      <Sidebar
        collapsed={false}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={false}
        onCloseMobile={onCloseMobile}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleBtn).toBeDefined();

    fireEvent.click(toggleBtn);
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('renders collapse toggle button with "Expand sidebar" aria-label when collapsed and toggles on click', () => {
    render(
      <Sidebar
        collapsed={true}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={false}
        onCloseMobile={onCloseMobile}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /expand sidebar/i });
    expect(toggleBtn).toBeDefined();

    fireEvent.click(toggleBtn);
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('handles mobile close interactions via mobile close button and backdrop', () => {
    render(
      <Sidebar
        collapsed={false}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={true}
        onCloseMobile={onCloseMobile}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /close sidebar/i });
    expect(closeBtn).toBeDefined();

    fireEvent.click(closeBtn);
    expect(onCloseMobile).toHaveBeenCalledTimes(1);

    const backdrop = document.querySelector('[class*="backdrop"]');
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onCloseMobile).toHaveBeenCalledTimes(2);
    }
  });

  it('renders storefront view link in footer', () => {
    render(
      <Sidebar
        collapsed={false}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={false}
        onCloseMobile={onCloseMobile}
      />
    );

    const viewStoreBtn = screen.getByRole('link', { name: /view storefront/i });
    expect(viewStoreBtn).toBeDefined();
    expect(viewStoreBtn.getAttribute('target')).toBe('_blank');
  });
});
