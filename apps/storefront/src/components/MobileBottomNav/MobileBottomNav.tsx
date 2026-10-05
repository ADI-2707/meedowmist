'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, User, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import MobileCategoryDrawer from './MobileCategoryDrawer';
import ProductSearchModal from '@/components/ProductSearchModal/ProductSearchModal';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const isHomeActive = pathname === '/';
  const isCategoryActive = pathname.startsWith('/candles') || pathname.startsWith('/ceramics');
  const isAccountActive = pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/signup');

  const accountHref = isAuthenticated ? '/account' : '/login?redirect=/account';

  return (
    <>
      <nav className={styles.navBar} aria-label="Mobile navigation dock">
        <Link
          href="/"
          className={`${styles.navItem} ${isHomeActive ? styles.navItemActive : ''}`}
          aria-label="Home"
        >
          {isHomeActive && <span className={styles.activeIndicator} aria-hidden="true" />}
          <span className={styles.iconWrap}>
            <Home size={20} />
          </span>
          <span className={styles.label}>Home</span>
        </Link>

        <button
          type="button"
          className={`${styles.navItem} ${isCategoryActive ? styles.navItemActive : ''}`}
          onClick={() => setCategoryOpen(true)}
          aria-label="Browse categories"
        >
          {isCategoryActive && <span className={styles.activeIndicator} aria-hidden="true" />}
          <span className={styles.iconWrap}>
            <LayoutGrid size={20} />
          </span>
          <span className={styles.label}>Categories</span>
        </button>

        <button
          type="button"
          className={styles.navItem}
          onClick={() => setSearchOpen(true)}
          aria-label="Search handcrafted catalog"
        >
          <span className={styles.iconWrap}>
            <Search size={20} />
          </span>
          <span className={styles.label}>Search</span>
        </button>

        <Link
          href={accountHref}
          className={`${styles.navItem} ${isAccountActive ? styles.navItemActive : ''}`}
          aria-label="Account & Orders"
        >
          {isAccountActive && <span className={styles.activeIndicator} aria-hidden="true" />}
          <span className={styles.iconWrap}>
            <User size={20} />
          </span>
          <span className={styles.label}>Account</span>
        </Link>

        <button
          type="button"
          className={styles.navItem}
          onClick={openCartDrawer}
          aria-label={`Open shopping bag (${itemCount} items)`}
        >
          <span className={styles.iconWrap}>
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {itemCount}
              </span>
            )}
          </span>
          <span className={styles.label}>Bag</span>
        </button>
      </nav>

      <MobileCategoryDrawer
        isOpen={categoryOpen}
        onClose={() => setCategoryOpen(false)}
      />

      <ProductSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
