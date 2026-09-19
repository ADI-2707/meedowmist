'use client';

import React from 'react';
import StarRating from '@/components/StarRating/StarRating';
import type { Review } from '@meadowmist/shared';
import styles from './ReviewList.module.css';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No reviews yet for this handcrafted piece. Be the first to share your experience.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {reviews.map((r) => {
        const formattedDate = new Date(r.createdAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <article key={r.id} className={styles.reviewCard}>
            <div className={styles.headerRow}>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{r.user?.name || 'Artisan Collector'}</span>
                {r.isVerifiedPurchase && (
                  <span className={styles.verifiedBadge}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Collector
                  </span>
                )}
              </div>
              <time dateTime={r.createdAt} className={styles.date}>
                {formattedDate}
              </time>
            </div>

            <StarRating rating={r.rating} />

            {r.title && <h4 className={styles.reviewTitle}>{r.title}</h4>}

            <p className={styles.reviewComment}>{r.comment}</p>
          </article>
        );
      })}
    </div>
  );
}
