'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import styles from './CartDrawer.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap & close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        aria-label="Shopping cart"
        aria-hidden={!open}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Your Bag</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.divider} />

        {items.length === 0 ? (
          <div className={styles.empty}>
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={styles.emptyIcon}>
              <path d="M12 4L6 12v28a4 4 0 004 4h28a4 4 0 004-4V12l-6-8H12z" stroke="var(--color-gold-soft)" strokeWidth="2" strokeLinejoin="round"/>
              <line x1="6" y1="12" x2="42" y2="12" stroke="var(--color-gold-soft)" strokeWidth="2"/>
              <path d="M32 20a8 8 0 01-16 0" stroke="var(--color-gold-soft)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className={styles.emptyText}>Your bag is empty.</p>
            <Link href="/candles" className={styles.shopLink} onClick={onClose}>
              Start shopping →
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.productId} className={styles.item}>
                  <div className={styles.itemImage}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="72px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <Link href={`/product/${item.slug}`} className={styles.itemName} onClick={onClose}>
                      {item.name}
                    </Link>
                    <p className={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</p>
                    <div className={styles.qtyRow}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className={styles.qtyNum}>{item.qty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name}`}
                      >Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span className={styles.subtotalAmount}>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <Link href="/cart" className={styles.viewCart} onClick={onClose}>
                View full cart
              </Link>
              <button className={styles.checkoutBtn} disabled aria-disabled="true">
                Checkout — Coming Soon
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
