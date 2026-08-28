'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard/ProductCard';
import SectionReveal from '@/components/SectionReveal/SectionReveal';
import styles from './CategoryGrid.module.css';

const SCENT_FILTERS = ['All', 'Floral', 'Woody', 'Fresh', 'Spice'];
const TYPE_FILTERS = ['All', 'Pillar', 'Wax Art'];

interface Props {
  products: Product[];
  type: 'candle' | 'ceramic';
}

export default function CategoryGrid({ products, type }: Props) {
  const [activeScent, setActiveScent] = useState('All');
  const [activeType, setActiveType] = useState('All');

  const ceramicTypes = ['All', 'Bowl', 'Trinket Box', 'Tealight', 'Planter'];

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const scentMatch =
        activeScent === 'All' ||
        (p.scentFamily && p.scentFamily.toLowerCase() === activeScent.toLowerCase());
      const typeMatch =
        activeType === 'All' ||
        p.subCategory.replace('-', ' ').toLowerCase() === activeType.toLowerCase();
      return type === 'candle' ? (activeScent === 'All' ? typeMatch : scentMatch) : typeMatch;
    });
  }, [products, activeScent, activeType, type]);

  return (
    <div>
      {/* Filter bar */}
      <div className={styles.filterBar} role="group" aria-label="Filter products">
        {type === 'candle' ? (
          <>
            {SCENT_FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterPill} ${activeScent === f ? styles.active : ''}`}
                onClick={() => { setActiveScent(f); setActiveType('All'); }}
                aria-pressed={activeScent === f}
              >
                {f}
              </button>
            ))}
            <span className={styles.filterSep} aria-hidden="true">|</span>
            {TYPE_FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterPill} ${activeType === f ? styles.active : ''}`}
                onClick={() => { setActiveType(f); setActiveScent('All'); }}
                aria-pressed={activeType === f}
              >
                {f}
              </button>
            ))}
          </>
        ) : (
          ceramicTypes.map((f) => (
            <button
              key={f}
              className={`${styles.filterPill} ${activeType === f ? styles.active : ''}`}
              onClick={() => setActiveType(f)}
              aria-pressed={activeType === f}
            >
              {f}
            </button>
          ))
        )}
      </div>

      {/* Results count */}
      <p className={styles.resultCount} aria-live="polite">
        {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((product, i) => (
            <SectionReveal key={product.id} delay={i * 0.08}>
              <ProductCard product={product} />
            </SectionReveal>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No pieces match this filter.</p>
          <button className={styles.resetBtn} onClick={() => { setActiveScent('All'); setActiveType('All'); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
