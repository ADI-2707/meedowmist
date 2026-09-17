'use client';

import { usePathname, useRouter } from 'next/navigation';
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
import styles from './admin.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/inventory', label: 'Inventory Stock', icon: Boxes },
  { href: '/admin/orders', label: 'Orders & Shipments', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/enquiries', label: 'Contact Enquiries', icon: MessageSquare },
  { href: '/admin/content', label: 'Store Content CMS', icon: FileText },
  { href: '/admin/promotions', label: 'Promo Discounts', icon: Tag },
  { href: '/admin/settings', label: 'Store Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout?admin=true', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
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
          <Link href="/" target="_blank" className={styles.viewStoreBtn}>
            <ExternalLink size={14} style={{ display: 'inline', marginRight: '6px' }} />
            View Storefront
          </Link>
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
  );
}
