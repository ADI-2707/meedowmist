import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileBottomNav from './MobileBottomNav';
import { useCartStore } from '@/store/cartStore';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('MobileBottomNav Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCartStore.getState().clearCart();
  });

  it('renders all 4 mobile navigation actions', () => {
    render(<MobileBottomNav />);

    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Categories')).toBeDefined();
    expect(screen.getByText('Search')).toBeDefined();
    expect(screen.getByText('Bag')).toBeDefined();
  });

  it('opens category drawer when categories button is clicked', () => {
    render(<MobileBottomNav />);

    const categoriesBtn = screen.getByRole('button', { name: /browse categories/i });
    fireEvent.click(categoriesBtn);

    expect(screen.getByText('Artisan Collections')).toBeDefined();
    expect(screen.getByText('Hand-Poured Soy Candles')).toBeDefined();
    expect(screen.getByText('Wheel-Thrown Ceramics')).toBeDefined();
  });

  it('displays bag counter badge when cart has items and triggers cart drawer', () => {
    useCartStore.getState().addItem({
      productId: 'prod_1',
      slug: 'test-candle',
      name: 'Test Candle',
      price: 500,
      image: '/test.jpg',
      category: 'candle',
    });

    render(<MobileBottomNav />);

    expect(screen.getByText('1')).toBeDefined();

    const bagBtn = screen.getByRole('button', { name: /open shopping bag/i });
    fireEvent.click(bagBtn);

    expect(useCartStore.getState().isDrawerOpen).toBe(true);
  });
});
