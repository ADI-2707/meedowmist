'use client';

import React from 'react';
import StarRating from '@/components/StarRating/StarRating';
import type { RatingDistribution } from '@meadowmist/shared';
import styles from './RatingSummary.module.css';

interface RatingSummaryProps {
  distribution: RatingDistribution;
}

export default function RatingSummary({ distribution }: RatingSummaryProps) {
  const { average, total, counts } = distribution;

  return (
    <div className={styles.summaryBox}>
      <div className={styles.scoreColumn}>
        <span className={styles.bigScore}>{average.toFixed(1)}</span>
        <StarRating rating={average} />
        <span className={styles.totalLabel}>
          {total} {total === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className={styles.barsColumn}>
        {[5, 4, 3, 2, 1].map((star) => {
          const starKey = star as keyof typeof counts;
          const count = counts[starKey] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={star} className={styles.barRow}>
              <span className={styles.starLabel}>{star} stars</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${percentage}%` }} />
              </div>
              <span className={styles.countLabel}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
