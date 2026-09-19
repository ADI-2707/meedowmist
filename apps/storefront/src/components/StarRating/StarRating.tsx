'use client';

import React, { useState } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'normal' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
  count?: number;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'normal',
  interactive = false,
  onRatingChange,
  showText = false,
  count,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={styles.starRating} role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} out of ${maxRating}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = activeRating >= starValue;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              className={`${styles.starBtn} ${isFilled ? styles.starFilled : styles.starEmpty}`}
              onClick={() => onRatingChange?.(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(null)}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              <svg
                viewBox="0 0 24 24"
                className={size === 'large' ? styles.starIconLarge : styles.starIcon}
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        }

        return (
          <span
            key={starValue}
            className={isFilled ? styles.starFilled : styles.starEmpty}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className={size === 'large' ? styles.starIconLarge : styles.starIcon}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
        );
      })}

      {showText && (
        <span className={styles.ratingText}>
          {rating.toFixed(1)}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </div>
  );
}
