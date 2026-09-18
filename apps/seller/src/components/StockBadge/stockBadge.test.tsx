import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StockBadge, BadgeStatus } from './StockBadge';

describe('Seller StockBadge Component', () => {
  const statuses: { status: BadgeStatus; label: string }[] = [
    { status: 'in-stock', label: 'In Stock' },
    { status: 'low-stock', label: 'Low Stock' },
    { status: 'out-of-stock', label: 'Out of Stock' },
    { status: 'pending', label: 'Pending' },
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' },
    { status: 'cancelled', label: 'Cancelled' },
  ];

  statuses.forEach(({ status, label }) => {
    it(`renders default label for status "${status}"`, () => {
      render(<StockBadge status={status} />);
      expect(screen.getByText(label)).toBeDefined();
    });
  });

  it('renders custom label over default label', () => {
    render(<StockBadge status="low-stock" label="Only 3 Left" />);
    expect(screen.getByText('Only 3 Left')).toBeDefined();
    expect(screen.queryByText('Low Stock')).toBeNull();
  });
});
