import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewList from './ReviewList';
import type { Review } from '@meadowmist/shared';

describe('ReviewList Component', () => {
  it('renders empty state message when review array is empty', () => {
    render(<ReviewList reviews={[]} />);

    expect(
      screen.getByText(/no reviews yet for this handcrafted piece/i)
    ).toBeDefined();
  });

  it('renders review card with user name, verified badge, rating, title, and comment', () => {
    const mockReviews: Review[] = [
      {
        id: 'rev-1',
        productId: 'prod-1',
        userId: 'usr-1',
        rating: 5,
        title: 'Exquisite Fragrance',
        comment: 'The scent fills the room beautifully without being overpowering.',
        status: 'APPROVED',
        isVerifiedPurchase: true,
        createdAt: '2026-09-10T12:00:00.000Z',
        updatedAt: '2026-09-10T12:00:00.000Z',
        user: {
          id: 'usr-1',
          name: 'Priya Sharma',
          email: 'priya@example.com',
        },
      },
    ];

    render(<ReviewList reviews={mockReviews} />);

    expect(screen.getByText('Priya Sharma')).toBeDefined();
    expect(screen.getByText(/verified collector/i)).toBeDefined();
    expect(screen.getByText('Exquisite Fragrance')).toBeDefined();
    expect(
      screen.getByText('The scent fills the room beautifully without being overpowering.')
    ).toBeDefined();
  });

  it('renders fallback author name and omits verified badge when not verified', () => {
    const mockReviews: Review[] = [
      {
        id: 'rev-2',
        productId: 'prod-1',
        userId: 'usr-2',
        rating: 4,
        comment: 'Nice handcrafted packaging.',
        status: 'APPROVED',
        isVerifiedPurchase: false,
        createdAt: '2026-09-12T12:00:00.000Z',
        updatedAt: '2026-09-12T12:00:00.000Z',
      },
    ];

    render(<ReviewList reviews={mockReviews} />);

    expect(screen.getByText('Artisan Collector')).toBeDefined();
    expect(screen.queryByText(/verified collector/i)).toBeNull();
    expect(screen.getByText('Nice handcrafted packaging.')).toBeDefined();
  });
});
