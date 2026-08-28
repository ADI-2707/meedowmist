'use client';

import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types/product';
import { useState } from 'react';
import styles from './AddToCartButton.module.css';

interface Props { product: Product; }

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      id={`add-to-cart-${product.id}`}
      className={`${styles.btn} ${added ? styles.added : ''}`}
      onClick={handleAdd}
      aria-label={added ? 'Added to bag' : `Add ${product.name} to bag`}
    >
      {added ? '✓ Added to bag' : 'Add to bag'}
    </button>
  );
}
