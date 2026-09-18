'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Layers, AlertCircle, RefreshCw, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StatCard } from '@/components/StatCard/StatCard';
import { StockBadge } from '@/components/StockBadge/StockBadge';
import { Pagination } from '@/components/Pagination/Pagination';
import styles from './inventory.module.css';

interface ProductInventory {
  id: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
}

interface Summary {
  totalCandles: number;
  totalCeramics: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface InventoryLogItem {
  id: string;
  productId: string;
  changeQuantity: number;
  newQuantity: number;
  reason: string;
  note?: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    category: string;
  };
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [logs, setLogs] = useState<InventoryLogItem[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async (currentPage = page, currentLimit = limit) => {
    setLoading(true);
    try {
      const [invRes, logsRes] = await Promise.all([
        fetch(`/api/inventory?filter=${filter}&page=${currentPage}&limit=${currentLimit}`),
        fetch('/api/inventory/logs'),
      ]);

      if (invRes.ok) {
        const data = await invRes.json();
        setProducts(data.products || []);
        setSummary(data.summary);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }

        const stockMap: Record<string, number> = {};
        for (const p of data.products || []) {
          stockMap[p.id] = p.stockQuantity;
        }
        setEditingStock(stockMap);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Inventory fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(1, limit);
  }, [filter]);

  useEffect(() => {
    fetchData(page, limit);
  }, [page, limit]);

  const handleStockChange = (id: string, delta: number) => {
    setEditingStock((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  };

  const handleStockInput = (id: string, val: string) => {
    const num = parseInt(val, 10);
    setEditingStock((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSaveStock = async (id: string) => {
    const newQty = editingStock[id];
    setSavingId(id);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          newQuantity: newQty,
          reason: 'MANUAL_ADJUSTMENT',
          note: 'Updated from inventory grid',
        }),
      });

      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to update stock');
      }
    } catch {
      alert('Error updating stock');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Stock & Warehousing"
        title="Inventory & Candle Stock"
        subtitle="Real-time batch stock management, candle counters, and inventory audit trail."
        actions={
          <button onClick={() => fetchData(page, limit)} className={styles.refreshBtn}>
            <RefreshCw size={15} />
            <span>Refresh Counts</span>
          </button>
        }
      />

      {summary && (
        <div className={styles.summaryGrid}>
          <StatCard
            label="Candles in Stock"
            value={`${summary.totalCandles} units`}
            icon={<Flame size={20} />}
            subtext="Artisanal hand-poured inventory"
          />
          <StatCard
            label="Ceramics in Stock"
            value={`${summary.totalCeramics} units`}
            icon={<Layers size={20} />}
            subtext="Handmade ceramic pots & vessels"
          />
          <StatCard
            label="Inventory Valuation"
            value={`₹${summary.totalInventoryValue.toLocaleString('en-IN')}`}
            icon={<IndianRupee size={20} />}
            subtext="Total warehoused retail value"
          />
          <StatCard
            label="Low Stock Alerts"
            value={summary.lowStockCount}
            icon={<AlertCircle size={20} />}
            subtext={summary.lowStockCount > 0 ? 'Requires immediate restock' : 'Stock levels healthy'}
            highlight={summary.lowStockCount > 0}
          />
        </div>
      )}

      <div className={styles.filterRow}>
        <button
          className={`${styles.filterBtn} ${filter === 'ALL' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Items
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'CANDLES' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('CANDLES')}
        >
          Candles Only
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'CERAMICS' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('CERAMICS')}
        >
          Ceramics Only
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'LOW_STOCK' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('LOW_STOCK')}
        >
          Low Stock Alert
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'OUT_OF_STOCK' ? styles.filterBtnActive : ''}`}
          onClick={() => setFilter('OUT_OF_STOCK')}
        >
          Out of Stock
        </button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading inventory items...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>No products found for the selected filter.</div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Threshold</th>
                  <th>Batch Adjustment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const currentEdit = editingStock[p.id] ?? p.stockQuantity;
                  const isChanged = currentEdit !== p.stockQuantity;
                  const isOut = p.stockQuantity === 0;
                  const isLow = !isOut && p.stockQuantity <= p.lowStockThreshold;

                  return (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/products/${p.id}/edit`} className={styles.productLink}>
                          {p.name}
                        </Link>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isOut ? '#c53030' : isLow ? '#dd6b20' : 'var(--color-forest)',
                          }}
                        >
                          {p.stockQuantity} pcs
                        </span>
                      </td>
                      <td>
                        <StockBadge
                          status={isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'}
                        />
                      </td>
                      <td style={{ opacity: 0.8 }}>Alert &lt; {p.lowStockThreshold}</td>
                      <td>
                        <div className={styles.stockControl}>
                          <button
                            type="button"
                            className={styles.stepperBtn}
                            onClick={() => handleStockChange(p.id, -5)}
                            title="-5 units"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            className={styles.stepperBtn}
                            onClick={() => handleStockChange(p.id, -1)}
                            title="-1 unit"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className={styles.stockInput}
                            value={currentEdit}
                            onChange={(e) => handleStockInput(p.id, e.target.value)}
                          />
                          <button
                            type="button"
                            className={styles.stepperBtn}
                            onClick={() => handleStockChange(p.id, 1)}
                            title="+1 unit"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className={styles.stepperBtn}
                            onClick={() => handleStockChange(p.id, 5)}
                            title="+5 units"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleSaveStock(p.id)}
                          disabled={savingId === p.id || !isChanged}
                          className={styles.saveBtn}
                          style={{ opacity: !isChanged ? 0.4 : 1 }}
                        >
                          {savingId === p.id ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      <div className={styles.logSection}>
        <h2 className={styles.sectionTitle}>Stock Adjustment Audit Logs</h2>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product</th>
                <th>Change</th>
                <th>New Balance</th>
                <th>Reason</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', opacity: 0.7 }}>
                    No audit records yet.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 15).map((log) => (
                  <tr key={log.id}>
                    <td>
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                      {log.product?.name || 'Item'}
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: log.changeQuantity > 0 ? '#2f855a' : '#c53030',
                      }}
                    >
                      {log.changeQuantity > 0 ? `+${log.changeQuantity}` : log.changeQuantity}
                    </td>
                    <td style={{ fontWeight: 600 }}>{log.newQuantity}</td>
                    <td>
                      <span className={styles.reasonPill}>
                        {log.reason.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ opacity: 0.8 }}>{log.note || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
