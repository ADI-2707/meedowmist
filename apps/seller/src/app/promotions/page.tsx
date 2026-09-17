'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import styles from '../products/products.module.css';

interface PromotionItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  timesUsed: number;
  usageLimit?: number | null;
  isActive: boolean;
}

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<PromotionItem[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrder, setMinOrder] = useState('499');
  const [maxDiscount, setMaxDiscount] = useState('200');
  const [loading, setLoading] = useState(true);

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/content/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromos(data.promotions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !discountValue) {
      alert('Code and discount value required');
      return;
    }

    try {
      const res = await fetch('/api/content/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          description: newDesc,
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: Number(minOrder) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        }),
      });

      if (res.ok) {
        setNewCode('');
        setNewDesc('');
        fetchPromos();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create promo');
      }
    } catch {
      alert('Error creating promotion');
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete this promotional code?')) return;
    try {
      await fetch(`/api/content/promotions?id=${id}`, { method: 'DELETE' });
      fetchPromos();
    } catch {
      alert('Error deleting promo');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Promotions & Discount Codes</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Create coupon codes, set percentage or fixed discounts, and track usage.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
        <div className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>Loading promo codes...</div>
          ) : promos.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>No active promotion codes found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Times Used</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--color-forest)', letterSpacing: '0.05em' }}>
                        {p.code}
                      </span>
                      {p.description && (
                        <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.description}</p>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {p.discountType === 'PERCENTAGE'
                        ? `${p.discountValue}% OFF`
                        : `₹${p.discountValue} FLAT`}
                    </td>
                    <td>₹{p.minOrderValue.toLocaleString('en-IN')}</td>
                    <td>{p.timesUsed} uses</td>
                    <td>
                      <button onClick={() => handleDeletePromo(p.id)} className={styles.deleteBtn}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={handleCreatePromo} className={styles.formCard}>
          <h2 className={styles.sectionTitle}>+ Create New Promo Code</h2>

          <div className={styles.field}>
            <label className={styles.label}>Coupon Code *</label>
            <input
              required
              className={styles.input}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="e.g. MEADOWFESTIVE"
            />
          </div>

          <div className={styles.field} style={{ marginTop: '12px' }}>
            <label className={styles.label}>Description</label>
            <input
              className={styles.input}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="10% off for new artisan lovers"
            />
          </div>

          <div className={styles.field} style={{ marginTop: '12px' }}>
            <label className={styles.label}>Discount Type</label>
            <select
              className={styles.select}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="PERCENTAGE">Percentage (% Discount)</option>
              <option value="FIXED">Fixed Amount (₹ Off)</option>
            </select>
          </div>

          <div className={styles.field} style={{ marginTop: '12px' }}>
            <label className={styles.label}>Discount Value *</label>
            <input
              type="number"
              required
              className={styles.input}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="10"
            />
          </div>

          <div className={styles.field} style={{ marginTop: '12px' }}>
            <label className={styles.label}>Minimum Order Value (₹)</label>
            <input
              type="number"
              className={styles.input}
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="499"
            />
          </div>

          {discountType === 'PERCENTAGE' && (
            <div className={styles.field} style={{ marginTop: '12px' }}>
              <label className={styles.label}>Maximum Discount Cap (₹, optional)</label>
              <input
                type="number"
                className={styles.input}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="200"
              />
            </div>
          )}

          <button type="submit" className={styles.addBtn} style={{ marginTop: '20px' }}>
            <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Create Promo Code
          </button>
        </form>
      </div>
    </div>
  );
}
