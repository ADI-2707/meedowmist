'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import styles from './page.module.css';
import type { Metadata } from 'next';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Your Bag</h1>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Your bag is empty.</p>
            <div className={styles.emptyCtas}>
              <Link href="/candles" className={styles.shopLink}>Shop Candles</Link>
              <Link href="/ceramics" className={styles.shopLink}>Shop Ceramics</Link>
            </div>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.itemsCol}>
              {items.map((item) => (
                <div key={item.productId} className={styles.item}>
                  <div className={styles.itemImg}>
                    <Image src={item.image} alt={item.name} fill sizes="100px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className={styles.itemInfo}>
                    <Link href={`/product/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                    <p className={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</p>
                    <div className={styles.qtyRow}>
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.productId, item.qty - 1)}>−</button>
                      <span className={styles.qtyNum}>{item.qty}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.productId, item.qty + 1)}>+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.productId)}>Remove</button>
                  </div>
                  <p className={styles.lineTotal}>₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                </div>
              ))}
              <button className={styles.clearBtn} onClick={clearCart}>Clear bag</button>
            </div>

            <div className={styles.summaryCol}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span className={styles.summaryTotal}>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <button className={styles.checkoutBtn} disabled aria-disabled="true">
                Checkout — Coming Soon
              </button>
              <p className={styles.checkoutNote}>
                Secure checkout will be available when we launch. Your cart is saved locally.
              </p>
              <Link href="/candles" className={styles.continueLink}>← Continue shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
