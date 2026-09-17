'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import styles from './promotions.module.css';

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
      <PageHeader
        eyebrow="Marketing & Growth"
        title="Promotions & Discounts"
        subtitle="Create coupon codes, specify percentage or flat cart rebates, and monitor redemption volume."
      />

      <div className={styles.splitGrid}>
        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.emptyState}>Loading promotional vouchers...</div>
          ) : promos.length === 0 ? (
            <div className={styles.emptyState}>No active promotion codes found.</div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Coupon Code</th>
                    <th>Discount Rate</th>
                    <th>Min. Cart Value</th>
                    <th>Redemptions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className={styles.promoCode}>{p.code}</span>
                        {p.description && (
                          <p className={styles.promoDesc}>{p.description}</p>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                          {p.discountType === 'PERCENTAGE'
                            ? `${p.discountValue}% OFF`
                            : `₹${p.discountValue} FLAT`}
                        </span>
                      </td>
                      <td>₹{p.minOrderValue.toLocaleString('en-IN')}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{p.timesUsed}</span> uses
                      </td>
                      <td>
                        <button onClick={() => handleDeletePromo(p.id)} className={styles.deleteBtn}>
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={handleCreatePromo} className={styles.formCard}>
          <h2 className={styles.sectionTitle}>+ Issue New Promo Code</h2>

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

          <div className={styles.field}>
            <label className={styles.label}>Customer Note / Description</label>
            <input
              className={styles.input}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g. Festive discount on artisanal orders"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Discount Calculation Type</label>
            <select
              className={styles.select}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="PERCENTAGE">Percentage Discount (%)</option>
              <option value="FLAT">Flat Rupee Amount (₹)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Rupee Value (₹) *'}
            </label>
            <input
              type="number"
              required
              className={styles.input}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Minimum Order Value (₹)</label>
            <input
              type="number"
              className={styles.input}
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
            />
          </div>

          {discountType === 'PERCENTAGE' && (
            <div className={styles.field}>
              <label className={styles.label}>Maximum Discount Cap (₹)</label>
              <input
                type="number"
                className={styles.input}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            <Plus size={14} />
            <span>Create Promo Code</span>
          </button>
        </form>
      </div>
    </div>
  );
}
