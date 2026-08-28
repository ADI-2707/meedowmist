'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/CartDrawer/CartDrawer';
import styles from './SiteHeader.module.css';

const NAV_LINKS = [
  { href: '/candles', label: 'Candles' },
  { href: '/ceramics', label: 'Ceramics' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="Meadow Mist — Home">
            <svg className={styles.logoTree} viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M24 44V28" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M24 28 C24 28 14 22 12 14 C10 6 18 4 22 10 C20 6 26 2 28 8 C30 4 36 6 36 14 C36 22 24 28 24 28Z" fill="var(--color-forest)" opacity="0.85"/>
              <path d="M24 28 C24 28 16 24 14 18" stroke="var(--color-forest)" strokeWidth="1" strokeLinecap="round" fill="none"/>
              <path d="M24 28 C24 28 32 24 34 18" stroke="var(--color-forest)" strokeWidth="1" strokeLinecap="round" fill="none"/>
              <circle cx="24" cy="14" r="2.5" fill="var(--color-gold)" opacity="0.9"/>
              <path d="M18 44 C18 44 20 42 24 44 C28 46 30 44 30 44" stroke="var(--color-forest)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
            </svg>
            <span className={styles.logoWordmark}>
              <span className={styles.logoMeadow}>MEADOW</span>
              <span className={styles.logoMist}>Mist</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
            <Link href="/account" className={`${styles.navLink} ${styles.navLinkDisabled}`} aria-disabled="true" tabIndex={-1}>
              Account
            </Link>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              id="cart-button"
              className={styles.cartButton}
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className={styles.cartBadge} aria-hidden="true">{itemCount}</span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`} aria-hidden={!menuOpen}>
          <nav aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
