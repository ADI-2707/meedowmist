'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import styles from './OrderReturnModal.module.css';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}

interface OrderReturnModalProps {
  isOpen: boolean;
  orderNumber: string;
  items: OrderItem[];
  onClose: () => void;
  onConfirm: (data: {
    reason: string;
    resolutionPreference: 'REFUND' | 'REPLACEMENT';
    notes: string;
    selectedItems: string[];
  }) => Promise<void>;
}

const RETURN_REASONS = [
  'Damaged during transit / broken ceramic piece',
  'Defective wick / improper burn / wax leak',
  'Received wrong fragrance, color, or variant',
  'Product differs significantly from photographs/description',
  'Other craftsmanship concern',
];

export function OrderReturnModal({
  isOpen,
  orderNumber,
  items,
  onClose,
  onConfirm,
}: OrderReturnModalProps) {
  const [selectedReason, setSelectedReason] = useState(RETURN_REASONS[0]);
  const [resolutionPreference, setResolutionPreference] = useState<'REFUND' | 'REPLACEMENT'>('REFUND');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setSelectedItemIds(items.map((i) => i.id));
    }
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) {
      alert('Please select at least one item to return');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm({
        reason: selectedReason,
        resolutionPreference,
        notes,
        selectedItems: selectedItemIds,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={submitting ? undefined : onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.eyebrow}>Artisan Guarantee</span>
            <h2 className={styles.title}>Request Return / Replacement</h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className={styles.closeBtn}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>
            <div className={styles.guaranteeBox}>
              <Sparkles size={18} />
              <div>
                <strong>7-Day Handcrafted Guarantee:</strong> If any ceramic piece or candle arrives broken, defective, or not as expected, we will gladly arrange a swift replacement or full refund.
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Select Item(s) to Return</label>
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <label key={item.id} className={styles.itemCheckboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                      disabled={submitting}
                    />
                    <span>
                      {item.productName} (Qty: {item.quantity})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="return-reason" className={styles.label}>
                Reason for Return
              </label>
              <select
                id="return-reason"
                className={styles.select}
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                disabled={submitting}
              >
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Preferred Resolution</label>
              <div className={styles.preferenceGrid}>
                <label
                  className={`${styles.preferenceCard} ${resolutionPreference === 'REFUND' ? styles.preferenceCardActive : ''}`}
                >
                  <input
                    type="radio"
                    name="preference"
                    checked={resolutionPreference === 'REFUND'}
                    onChange={() => setResolutionPreference('REFUND')}
                  />
                  <div>
                    <div className={styles.preferenceTitle}>Original Refund</div>
                    <div className={styles.preferenceDesc}>
                      Amount credited back to original payment source
                    </div>
                  </div>
                </label>

                <label
                  className={`${styles.preferenceCard} ${resolutionPreference === 'REPLACEMENT' ? styles.preferenceCardActive : ''}`}
                >
                  <input
                    type="radio"
                    name="preference"
                    checked={resolutionPreference === 'REPLACEMENT'}
                    onChange={() => setResolutionPreference('REPLACEMENT')}
                  />
                  <div>
                    <div className={styles.preferenceTitle}>Studio Replacement</div>
                    <div className={styles.preferenceDesc}>
                      We hand-pack and dispatch a fresh replacement piece
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="return-notes" className={styles.label}>
                Craftsmanship Details / Issue Notes
              </label>
              <textarea
                id="return-notes"
                className={styles.textarea}
                placeholder="Describe any damage, hairline cracks, or fragrance concerns..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting}
                maxLength={400}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={styles.secondaryBtn}
            >
              Keep Items
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Return Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
