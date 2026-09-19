import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RatingSummary from './RatingSummary';
import type { RatingDistribution } from '@meadowmist/shared';

describe('RatingSummary Component', () => {
  it('renders overall average score and review count pluralization', () => {
    const distribution: RatingDistribution = {
      average: 4.666,
      total: 3,
      counts: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 },
    };

    render(<RatingSummary distribution={distribution} />);

    expect(screen.getByText('4.7')).toBeDefined();
    expect(screen.getByText('3 reviews')).toBeDefined();
  });

  it('renders singular review label when total is 1', () => {
    const distribution: RatingDistribution = {
      average: 5.0,
      total: 1,
      counts: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    render(<RatingSummary distribution={distribution} />);

    expect(screen.getByText('5.0')).toBeDefined();
    expect(screen.getByText('1 review')).toBeDefined();
  });

  it('renders star breakdown rows from 5 down to 1 with counts', () => {
    const distribution: RatingDistribution = {
      average: 4.0,
      total: 10,
      counts: { 5: 5, 4: 3, 3: 1, 2: 1, 1: 0 },
    };

    render(<RatingSummary distribution={distribution} />);

    expect(screen.getByText('5 stars')).toBeDefined();
    expect(screen.getByText('4 stars')).toBeDefined();
    expect(screen.getByText('3 stars')).toBeDefined();
    expect(screen.getByText('2 stars')).toBeDefined();
    expect(screen.getByText('1 stars')).toBeDefined();

    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('handles 0 reviews gracefully', () => {
    const distribution: RatingDistribution = {
      average: 0,
      total: 0,
      counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    render(<RatingSummary distribution={distribution} />);

    expect(screen.getByText('0.0')).toBeDefined();
    expect(screen.getByText('0 reviews')).toBeDefined();
  });
});
