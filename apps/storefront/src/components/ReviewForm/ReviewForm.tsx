'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StarRating from '@/components/StarRating/StarRating';
import type { Review } from '@meadowmist/shared';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
  productId: string;
  isLoggedIn: boolean;
  onReviewSubmitted: (review: Review) => void;
}

export default function ReviewForm({
  productId,
  isLoggedIn,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className={styles.loginPrompt}>
        <span>Have you experienced this piece? </span>
        <Link href={`/login?redirect=/product/${productId}`} className={styles.loginLink}>
          Sign in to leave a review
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 5) {
      setError('Please write at least 5 characters in your review.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setTitle('');
      setComment('');
      setRating(5);
      onReviewSubmitted(data.review);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h3 className={styles.title}>Leave an Artisan Review</h3>

      <div className={styles.ratingSelectGroup}>
        <span className={styles.label}>Your Rating</span>
        <StarRating
          rating={rating}
          size="large"
          interactive
          onRatingChange={setRating}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="review-title" className={styles.label}>
          Headline (Optional)
        </label>
        <input
          id="review-title"
          type="text"
          className={styles.input}
          placeholder="e.g. Beautiful scent throw, burns cleanly"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="review-comment" className={styles.label}>
          Your Thoughts & Experience *
        </label>
        <textarea
          id="review-comment"
          required
          className={styles.textarea}
          placeholder="Share your thoughts on the texture, fragrance, burn time, or craftsmanship..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}
      {success && (
        <div className={styles.successMsg}>
          Thank you! Your review has been published.
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={styles.submitBtn}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
