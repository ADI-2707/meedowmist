'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, EyeOff, Trash2 } from 'lucide-react';
import styles from './reviews.module.css';

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    images: string;
  };
}

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (ratingFilter) params.set('rating', ratingFilter);

      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: !currentStatus }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: !currentStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Customer Reviews & Ratings</h1>
          <p className={styles.subtitle}>Moderate feedback, verified collector impressions, and ratings.</p>
        </div>
      </header>

      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by customer name, title, or review text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">All Star Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading customer reviews...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>No customer reviews found matching your filters.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Product</th>
                <th className={styles.th}>Rating</th>
                <th className={styles.th}>Reviewer</th>
                <th className={styles.th}>Review Content</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => {
                let imgUrl = '/images/products/sunflower-wax-cluster-yellow.jpg';
                try {
                  const parsed = JSON.parse(r.product.images);
                  if (Array.isArray(parsed) && parsed[0]) imgUrl = parsed[0];
                } catch {
                  if (r.product.images) imgUrl = r.product.images;
                }

                return (
                  <tr key={r.id}>
                    <td className={styles.td}>
                      <div className={styles.productCell}>
                        <Image
                          src={imgUrl}
                          alt={r.product.name}
                          width={40}
                          height={40}
                          className={styles.productThumb}
                        />
                        <span className={styles.productName}>{r.product.name}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.ratingBadge}>
                        <Star size={14} fill="currentColor" />
                        {r.rating} / 5
                      </span>
                    </td>
                    <td className={styles.td}>
                      <strong>{r.user.name}</strong>
                      <br />
                      <small style={{ color: '#718096' }}>{r.user.email}</small>
                    </td>
                    <td className={styles.td} style={{ maxWidth: 360 }}>
                      {r.title && (
                        <strong style={{ display: 'block', marginBottom: 4 }}>{r.title}</strong>
                      )}
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#4a5568' }}>{r.comment}</p>
                    </td>
                    <td className={styles.td}>
                      <span
                        className={r.isApproved ? styles.statusApproved : styles.statusHidden}
                      >
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => toggleApproval(r.id, r.isApproved)}
                          title={r.isApproved ? 'Hide Review' : 'Approve Review'}
                        >
                          {r.isApproved ? <EyeOff size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => deleteReview(r.id)}
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
