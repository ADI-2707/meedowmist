'use client';

import { useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import PriceTag from '@/components/PriceTag/PriceTag';
import ScentBadge from '@/components/ScentBadge/ScentBadge';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useRef(false);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));

  const cartItem = items.find((i) => i.productId === product.id);
  const qty = cartItem?.qty ?? 0;

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced.current || !innerRef.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to +1
    const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to +1
    const rx = dy * -6;   // max 6° tilt
    const ry = dx * 6;
    innerRef.current.style.setProperty('--card-rx', `${rx}deg`);
    innerRef.current.style.setProperty('--card-ry', `${ry}deg`);
  }, []);

  const resetTilt = useCallback(() => {
    if (!innerRef.current) return;
    innerRef.current.style.setProperty('--card-rx', '0deg');
    innerRef.current.style.setProperty('--card-ry', '0deg');
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.images[0],
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article
      className={styles.card}
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div className={styles.inner} ref={innerRef}>
        {/* Sheen overlay — simulates glaze light */}
        <div className={styles.sheen} aria-hidden="true" />

        {/* Badge */}
        {product.badge && (
          <span className={`${styles.badge} ${styles[`badge-${product.badge}`]}`}>
            {product.badge === 'bestseller' ? 'Bestseller' : product.badge === 'new' ? 'New' : 'Limited'}
          </span>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
        >
          <svg viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>

        {/* Product image — clickable link */}
        <Link
          href={`/product/${product.slug}`}
          className={styles.imageLink}
          aria-label={`View ${product.name} — ₹${(product.salePrice ?? product.price).toLocaleString('en-IN')}`}
        >
          <div className={styles.imageWrapper}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              className={styles.image}
            />
          </div>
        </Link>

        {/* Card body — stays grounded while image lifts */}
        <div className={styles.body}>
          <div className={styles.meta}>
            {product.scentFamily && (
              <ScentBadge family={product.scentFamily} colorFamily={product.colorFamily} />
            )}
            {product.subCategory && !product.scentFamily && (
              <ScentBadge family={product.subCategory as 'floral'} colorFamily={product.colorFamily} />
            )}
          </div>

          <h3 className={styles.name}>
            <Link href={`/product/${product.slug}`} className={styles.titleLink}>
              {product.name}
            </Link>
          </h3>
          <p className={styles.story}>{product.story.slice(0, 72)}…</p>

          <div className={styles.footer}>
            <PriceTag price={product.price} salePrice={product.salePrice} />
            {qty > 0 ? (
              <div
                className={styles.qtyControl}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <button
                  type="button"
                  className={styles.qtyMinusBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQty(product.id, qty - 1);
                  }}
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  −
                </button>
                <span className={styles.qtyCount}>{qty}</span>
                <button
                  type="button"
                  className={styles.qtyPlusBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQty(product.id, qty + 1);
                  }}
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to bag`}
              >
                Add to bag
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
