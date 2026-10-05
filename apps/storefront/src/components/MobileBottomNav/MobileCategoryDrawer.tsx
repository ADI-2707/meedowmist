'use client';

import React from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import styles from './MobileCategoryDrawer.module.css';

interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  {
    href: '/candles',
    title: 'Hand-Poured Soy Candles',
    subtitle: 'Small-batch botanical fragrances & pillar designs',
  },
  {
    href: '/ceramics',
    title: 'Wheel-Thrown Ceramics',
    subtitle: 'Lotus bowls, textured vases & trinket dishes',
  },
  {
    href: '/our-story',
    title: 'Our Artisan Story',
    subtitle: 'Behind the craft and intentional living',
  },
  {
    href: '/contact',
    title: 'Contact Studio',
    subtitle: 'Get in touch for custom gifting & orders',
  },
];

export default function MobileCategoryDrawer({
  isOpen,
  onClose,
}: MobileCategoryDrawerProps) {
  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Category Navigation"
      >
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <h2 className={styles.title}>Artisan Collections</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close category menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={styles.categoryCard}
              onClick={onClose}
            >
              <div className={styles.cardMain}>
                <span className={styles.cardTitle}>{cat.title}</span>
                <span className={styles.cardSubtitle}>{cat.subtitle}</span>
              </div>
              <ChevronRight size={18} className={styles.cardArrow} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
