'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Phone, ShoppingBag, Heart, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StatCard } from '@/components/StatCard/StatCard';
import { Pagination } from '@/components/Pagination/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 350);

  const fetchCustomers = async (currentPage = page, currentLimit = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      params.set('page', String(currentPage));
      params.set('limit', String(currentLimit));

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchCustomers(1, limit);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCustomers(page, limit);
  }, [page, limit]);

  const totalRegistered = total || customers.length;
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
          <div className={styles.loadingState}>Loading customer records...</div>
        ) : customers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={32} opacity={0.5} />
            <p>No customer profiles found.</p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact Info</th>
                  <th>Primary Shipping Destination</th>
                  <th>Orders</th>
                  <th>Total Spend</th>
                  <th>Wishlist</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.customerAvatarCell}>
                        <div className={styles.avatarCircle}>
                          {c.name.slice(0, 1).toUpperCase()}
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
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
