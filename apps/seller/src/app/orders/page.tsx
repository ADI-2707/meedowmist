'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StockBadge, BadgeStatus } from '@/components/StockBadge/StockBadge';
import styles from './orders.module.css';

interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string | null;
  returnStatus?: string | null;
  items: { id: string; quantity: number }[];
  user?: { name: string; email: string; phone?: string | null } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Orders load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const mapStatusToBadge = (status: string): BadgeStatus => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'pending';
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'confirmed';
      case 'SHIPPED':
        return 'shipped';
      case 'DELIVERED':
        return 'delivered';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Orders & Fulfillment"
        eyebrow="Order Lifecycle"
        subtitle="Process incoming orders, assign couriers, generate tracking numbers, and handle customer returns."
      />

      <div className={styles.filterBar}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by Order #, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.viewBtn} style={{ padding: '8px 14px' }}>
            <Search size={14} />
          </button>
        </form>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Order Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            No orders found matching the filter criteria.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const totalQty = o.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/orders/${o.id}`} className={styles.orderNum}>
                        {o.orderNumber}
                      </Link>
                      {o.returnStatus === 'REQUESTED' && (
                        <span style={{ display: 'block', color: '#c53030', fontSize: '0.7rem', fontWeight: 700 }}>
                          Return Requested
                        </span>
                      )}
                    </td>
                    <td>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <p style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                        {o.user?.name || 'Customer'}
                      </p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{o.user?.email}</p>
                    </td>
                    <td>{totalQty} item{totalQty === 1 ? '' : 's'}</td>
                    <td style={{ fontWeight: 700 }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>{o.paymentMethod}</span>
                      <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7 }}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <StockBadge status={mapStatusToBadge(o.status)} label={o.status} />
                    </td>
                    <td>
                      <Link href={`/orders/${o.id}`} className={styles.viewBtn}>
                        <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
