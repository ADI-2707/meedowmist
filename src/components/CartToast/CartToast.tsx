'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import styles from './CartToast.module.css';

export default function CartToast() {
  const items = useCartStore((s) => s.items);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [toastItem, setToastItem] = useState<{
    name: string;
    price: number;
    image: string;
    id: number;
  } | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    // Get the latest item in items
    const latest = items[items.length - 1];
    setToastItem({
      name: latest.name,
      price: latest.price,
      image: latest.image,
      id: Date.now(),
    });

    const timer = setTimeout(() => {
      setToastItem(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [items]);

  const handleViewBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDrawer();
    setToastItem(null);
  };

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence mode="wait">
        {toastItem && (
          <motion.div
            key={toastItem.id}
            className={styles.toast}
            initial={{ opacity: 0, x: 60, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 120, scale: 0.9, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleViewBag}
            role="status"
            aria-live="polite"
          >
            <div className={styles.thumb}>
              <Image
                src={toastItem.image}
                alt={toastItem.name}
                fill
                sizes="44px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.info}>
              <p className={styles.statusLine}>
                <span className={styles.checkIcon}>✓</span> Added to your bag
              </p>
              <p className={styles.nameLine}>
                {toastItem.name} · <span className={styles.price}>₹{toastItem.price.toLocaleString('en-IN')}</span>
              </p>
            </div>
            <button type="button" className={styles.viewBtn} onClick={handleViewBag}>
              View Bag →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
