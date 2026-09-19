'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types/product';
import styles from './AddToCartButton.module.css';

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);

  const fragrances = product.customOptions?.fragrances || [];
  const waxTones = product.customOptions?.waxTones || [];
  const sizes = product.customOptions?.sizes || [];
  const allowGiftMessage = product.customOptions?.allowGiftMessage || false;

  const [selectedFragrance, setSelectedFragrance] = useState<string>(fragrances[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(waxTones[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isClickLocked, setIsClickLocked] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const qty = cartItem?.qty ?? 0;
  const isOutOfStock = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
  const isLowStock = product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 5);

  const handleAdd = () => {
    if (isOutOfStock || isClickLocked) return;
    setIsClickLocked(true);
    setTimeout(() => {
      setIsClickLocked(false);
    }, 250);

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.images[0],
      category: product.category,
      selectedFragrance: selectedFragrance || undefined,
      selectedColor: selectedColor || undefined,
      selectedSize: selectedSize || undefined,
      customNotes: customNotes || undefined,
    });
  };

  return (
    <div style={{ width: '100%' }}>
      {isOutOfStock ? (
        <div className={`${styles.stockStatus} ${styles.lowStock}`}>
          Currently Out of Stock — Next small batch in progress
        </div>
      ) : isLowStock ? (
        <div className={`${styles.stockStatus} ${styles.lowStock}`}>
          Only {product.stockQuantity} pieces left in this run
        </div>
      ) : (
        <div className={`${styles.stockStatus} ${styles.inStock}`}>
          In Stock · Ready for small-batch packaging
        </div>
      )}

      {(fragrances.length > 0 || waxTones.length > 0 || sizes.length > 0 || allowGiftMessage) && (
        <div className={styles.customSection}>
          {fragrances.length > 0 && (
            <div className={styles.optionGroup}>
              <span className={styles.optionTitle}>Select Scent</span>
              <div className={styles.pills}>
                {fragrances.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`${styles.pill} ${selectedFragrance === f ? styles.pillActive : ''}`}
                    onClick={() => setSelectedFragrance(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {waxTones.length > 0 && (
            <div className={styles.optionGroup}>
              <span className={styles.optionTitle}>Wax / Finish Shade</span>
              <div className={styles.pills}>
                {waxTones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.pill} ${selectedColor === t ? styles.pillActive : ''}`}
                    onClick={() => setSelectedColor(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className={styles.optionGroup}>
              <span className={styles.optionTitle}>Size</span>
              <div className={styles.pills}>
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.pill} ${selectedSize === s ? styles.pillActive : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allowGiftMessage && (
            <div className={styles.optionGroup}>
              <span className={styles.optionTitle}>Custom Gift Note / Packaging Request</span>
              <input
                type="text"
                className={styles.notesInput}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Include a handwritten card note (optional)"
              />
            </div>
          )}
        </div>
      )}

      {qty > 0 ? (
        <div className={styles.qtyPill}>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => updateQty(product.id, qty - 1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className={styles.qtyLabel}>{qty} in bag</span>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => updateQty(product.id, qty + 1)}
            disabled={product.stockQuantity !== undefined && qty >= product.stockQuantity}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      ) : (
        <button
          id={`add-to-cart-${product.id}`}
          className={styles.btn}
          onClick={handleAdd}
          disabled={isOutOfStock}
          aria-label={`Add ${product.name} to bag`}
        >
          {isOutOfStock ? 'Sold Out' : 'Add to bag'}
        </button>
      )}
    </div>
  );
}
