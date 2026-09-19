import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from './StarRating';

describe('StarRating Component', () => {
  it('renders read-only display with accessibility label', () => {
    render(<StarRating rating={4} maxRating={5} />);
    const ratingGroup = screen.getByRole('img');
    expect(ratingGroup).toBeDefined();
    expect(ratingGroup.getAttribute('aria-label')).toBe('Rating: 4 out of 5');
  });

  it('renders score text and count when showText is true', () => {
    render(<StarRating rating={4.8} showText count={15} />);
    expect(screen.getByText('4.8 (15)')).toBeDefined();
  });

  it('renders interactive button elements and triggers onRatingChange callback on click', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={3} interactive onRatingChange={handleChange} />);

    const star4 = screen.getByLabelText('4 stars');
    expect(star4).toBeDefined();

    fireEvent.click(star4);
    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
