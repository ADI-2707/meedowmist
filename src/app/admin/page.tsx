'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  Flame,
  Layers,
  AlertTriangle,
  PlusCircle,
  Boxes,
} from 'lucide-react';
import styles from './dashboard.module.css';

interface SummaryData {
  totalRevenue: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  processingOrdersCount: number;
  shippedOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
  returnRequestedCount: number;
  totalProductsCount: number;
  totalCandlesInStock: number;
  totalCeramicsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface BestSellingItem {
  productId: string;
  productName: string;
  productImage: string;
  category: string;
  unitsSold: number;
  revenue: number;
  currentStock: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [bestSelling, setBestSelling] = useState<BestSellingItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary);
          setBestSelling(data.bestSelling || []);
          setRecentOrders(data.recentOrders || []);
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading seller metrics...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeRow}>
        <div>
          <h1 className={styles.welcomeTitle}>Store Overview</h1>
          <p className={styles.welcomeSubtitle}>
            Live inventory, candle production counts, and incoming orders.
          </p>
        </div>

        <div className={styles.actionRow}>
          <Link href="/admin/products/new" className={styles.actionBtn}>
            <PlusCircle size={16} />
            Add New Product
          </Link>
          <Link href="/admin/inventory" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
            <Boxes size={16} />
            Update Stock
          </Link>
        </div>
      </div>

      {summary && summary.pendingOrdersCount > 0 && (
        <div className={styles.alertBanner}>
          <div className={styles.alertText}>
            You have {summary.pendingOrdersCount} pending order{summary.pendingOrdersCount === 1 ? '' : 's'} waiting for packaging and dispatch.
          </div>
          <Link href="/admin/orders" className={styles.alertLink}>
            Review Orders →
          </Link>
        </div>
      )}

      {summary && (
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Total Revenue</span>
              <IndianRupee size={20} color="var(--color-gold)" />
            </div>
            <span className={styles.metricVal}>₹{summary.totalRevenue.toLocaleString('en-IN')}</span>
            <span className={styles.metricNote}>From {summary.totalOrdersCount - summary.cancelledOrdersCount} active sales</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Total Orders</span>
              <ShoppingBag size={20} color="var(--color-forest)" />
            </div>
            <span className={styles.metricVal}>{summary.totalOrdersCount}</span>
            <span className={styles.metricNote}>{summary.deliveredOrdersCount} delivered</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Pending Dispatch</span>
              <Clock size={20} color="#dd6b20" />
            </div>
            <span className={styles.metricVal} style={{ color: summary.pendingOrdersCount > 0 ? '#dd6b20' : undefined }}>
              {summary.pendingOrdersCount}
            </span>
            <span className={styles.metricNote}>{summary.processingOrdersCount} in preparation</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Candles in Stock</span>
              <Flame size={20} color="var(--color-gold)" />
            </div>
            <span className={styles.metricVal}>{summary.totalCandlesInStock}</span>
            <span className={styles.metricNote}>Poured & cured units</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Ceramics in Stock</span>
              <Layers size={20} color="var(--color-clay)" />
            </div>
            <span className={styles.metricVal}>{summary.totalCeramicsInStock}</span>
            <span className={styles.metricNote}>Glazed & fired pieces</span>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Low Stock Alert</span>
              <AlertTriangle size={20} color="#c53030" />
            </div>
            <span className={styles.metricVal} style={{ color: summary.lowStockCount > 0 ? '#c53030' : undefined }}>
              {summary.lowStockCount}
            </span>
            <span className={styles.metricNote}>{summary.outOfStockCount} out of stock</span>
          </div>
        </div>
      )}

      <div className={styles.lowerGrid}>
        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Best-Selling Products</h2>
            <Link href="/admin/products" className={styles.cardLink}>
              View All Catalog
            </Link>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {bestSelling.map((p) => (
                <tr key={p.productId}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productThumb}>
                        <Image src={p.productImage} alt={p.productName} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <span className={styles.productName}>{p.productName}</span>
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ fontWeight: 600 }}>{p.unitsSold}</td>
                  <td>₹{p.revenue.toLocaleString('en-IN')}</td>
                  <td>
                    <span style={{ color: p.currentStock <= 5 ? '#c53030' : '#2f855a', fontWeight: 600 }}>
                      {p.currentStock} left
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Orders</h2>
            <Link href="/admin/orders" className={styles.cardLink}>
              All Orders
            </Link>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const statusClass =
                  o.status === 'DELIVERED'
                    ? styles.pillDelivered
                    : o.status === 'SHIPPED'
                    ? styles.pillShipped
                    : o.status === 'PROCESSING'
                    ? styles.pillProcessing
                    : o.status === 'CANCELLED'
                    ? styles.pillCancelled
                    : styles.pillPending;

                return (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/orders/${o.id}`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>{o.customerName}</td>
                    <td style={{ fontWeight: 600 }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`${styles.statusPill} ${statusClass}`}>{o.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
