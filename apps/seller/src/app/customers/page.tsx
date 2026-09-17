'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, Heart, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StatCard } from '@/components/StatCard/StatCard';
import styles from './customers.module.css';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  totalOrders: number;
  lifetimeSpend: number;
  wishlistCount: number;
  primaryAddress: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const totalRegistered = customers.length;
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalSpend = customers.reduce((sum, c) => sum + c.lifetimeSpend, 0);

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Clientele"
        title="Registered Customers"
        subtitle="Customer directory, order frequency, lifetime revenue, and shipping addresses."
      />

      <div className={styles.metricsGrid}>
        <StatCard
          label="Registered Clients"
          value={`${totalRegistered} buyers`}
          icon={<Users size={20} />}
          subtext="Total unique authenticated accounts"
        />
        <StatCard
          label="Cumulative Orders"
          value={`${totalOrders} orders`}
          icon={<ShoppingBag size={20} />}
          subtext="Total orders placed by clientele"
        />
        <StatCard
          label="Lifetime Spend"
          value={`₹${totalSpend.toLocaleString('en-IN')}`}
          icon={<IndianRupee size={20} />}
          subtext="Total gross customer value"
        />
      </div>

      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by customer name, email address, or mobile number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading customer directory...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>No registered customers match your search.</div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer Profile</th>
                  <th>Contact Details</th>
                  <th>Primary Address</th>
                  <th>Total Orders</th>
                  <th>Lifetime Spend</th>
                  <th>Saved Wishlist</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className={styles.avatar}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className={styles.customerName}>{c.name}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactLine}>
                        <Mail size={13} />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className={styles.contactLineSecondary}>
                          <Phone size={12} />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-ink)' }}>
                        {c.primaryAddress}
                      </span>
                    </td>
                    <td>
                      <span className={styles.orderCount}>
                        <ShoppingBag size={13} />
                        <span>{c.totalOrders}</span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.spendAmount}>
                        ₹{c.lifetimeSpend.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span className={styles.wishlistCount}>
                        <Heart size={13} color="var(--color-gold)" />
                        <span>{c.wishlistCount}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
