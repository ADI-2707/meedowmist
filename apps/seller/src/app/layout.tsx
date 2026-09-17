'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  MessageSquare,
  FileText,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import './globals.css';
import styles from './admin.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/inventory', label: 'Inventory Stock', icon: Boxes },
  { href: '/orders', label: 'Orders & Shipments', icon: ShoppingBag },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/enquiries', label: 'Contact Enquiries', icon: MessageSquare },
  { href: '/content', label: 'Store Content CMS', icon: FileText },
  { href: '/promotions', label: 'Promo Discounts', icon: Tag },
  { href: '/settings', label: 'Store Settings', icon: Settings },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const isLogin = pathname === '/login';

  return (
    <html lang="en">
      <head>
        <title>Meadow Mist — Seller Portal</title>
        <meta name="description" content="Dedicated administrative seller portal for Meadow Mist" />
      </head>
      <body>
        {isLogin ? (
          children
        ) : (
          <div className={styles.shell}>
            <aside className={styles.sidebar}>
              <div className={styles.brand}>
                <Image
                  src="/images/logo.jpg"
                  alt="Meadow Mist"
                  width={36}
                  height={36}
                  style={{ borderRadius: '50%' }}
                />
                <div>
                  <span className={styles.brandName}>Meadow Mist</span>
                  <span className={styles.brandBadge}>Single Seller Portal</span>
                </div>
              </div>

              <nav className={styles.nav}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className={styles.sidebarFooter}>
                <a
                  href={storefrontUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.viewStoreBtn}
                >
                  <ExternalLink size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  View Storefront
                </a>
              </div>
            </aside>

            <div className={styles.contentWrapper}>
              <header className={styles.topbar}>
                <div className={styles.topbarTitle}>Meadow Mist Administration</div>
                <div className={styles.topbarActions}>
                  <span className={styles.adminBadge}>Store Owner</span>
                  <button onClick={handleLogout} className={styles.logoutBtn}>
                    <LogOut size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Sign Out
                  </button>
                </div>
              </header>

              <main className={styles.main}>{children}</main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
