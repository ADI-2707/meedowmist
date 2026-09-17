'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, Heart } from 'lucide-react';
import styles from '../orders/orders.module.css';

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Registered Customers</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Customer profiles, order frequency, lifetime spend, and delivery locations.
          </p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by customer name, email, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Loading customer directory...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>No customers found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Primary Location</th>
                <th>Orders</th>
                <th>Lifetime Spend</th>
                <th>Wishlist</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-gold-soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--color-forest)',
                        }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {c.email}
                    </p>
                    {c.phone && (
                      <p style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {c.phone}
                      </p>
                    )}
                  </td>
                  <td>{c.primaryAddress}</td>
                  <td>
                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShoppingBag size={12} /> {c.totalOrders}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                    ₹{c.lifetimeSpend.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                      <Heart size={12} /> {c.wishlistCount}
                    </span>
                  </td>
                  <td>
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
