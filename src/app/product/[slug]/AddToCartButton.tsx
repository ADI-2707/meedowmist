'use client';

import { useCartStore } from '@/store/cartStore';
import type { Product } from '@/types/product';
import styles from './AddToCartButton.module.css';

interface Props { product: Product; }

export default function AddToCartButton({ product }: Props) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);

  const cartItem = items.find((i) => i.productId === product.id);
  const qty = cartItem?.qty ?? 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.images[0],
    });
  };

  if (qty > 0) {
    return (
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
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      id={`add-to-cart-${product.id}`}
      className={styles.btn}
      onClick={handleAdd}
      aria-label={`Add ${product.name} to bag`}
    >
      Add to bag
    </button>
  );
}
