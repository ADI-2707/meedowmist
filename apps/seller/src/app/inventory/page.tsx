'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Layers, AlertCircle, RefreshCw } from 'lucide-react';
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, logsRes] = await Promise.all([
        fetch(`/api/inventory?filter=${filter}`),
        fetch('/api/inventory/logs'),
      ]);

      if (invRes.ok) {
        const data = await invRes.json();
        setProducts(data.products || []);
        setSummary(data.summary);

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
    fetchData();
  }, [filter]);

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
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory & Candle Stock</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Real-time batch stock management, candle counters, and inventory audit trail.
          </p>
        </div>

        <button onClick={fetchData} className={styles.saveBtn} style={{ padding: '8px 16px' }}>
          <RefreshCw size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Refresh Stock
        </button>
      </div>

      {summary && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Candles in Stock</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={24} color="var(--color-gold)" />
              <span className={styles.summaryVal}>{summary.totalCandles}</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Total Ceramics in Stock</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={24} color="var(--color-clay)" />
              <span className={styles.summaryVal}>{summary.totalCeramics}</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Inventory Valuation</span>
            <span className={styles.summaryVal}>₹{summary.totalInventoryValue.toLocaleString('en-IN')}</span>
          </div>

          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Low Stock Warnings</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={24} color="#dd6b20" />
              <span className={styles.summaryVal} style={{ color: summary.lowStockCount > 0 ? '#dd6b20' : undefined }}>
                {summary.lowStockCount}
              </span>
            </div>
          </div>
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
          <div style={{ padding: '32px', textAlign: 'center' }}>Loading inventory...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Inline Adjustment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const currentEdit = editingStock[p.id] ?? p.stockQuantity;
                const isChanged = currentEdit !== p.stockQuantity;

                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/products/${p.id}/edit`} style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: p.stockQuantity === 0 ? '#c53030' : p.stockQuantity <= p.lowStockThreshold ? '#dd6b20' : '#2f855a',
                        }}
                      >
                        {p.stockQuantity} pieces
                      </span>
                    </td>
                    <td>Alert below {p.lowStockThreshold}</td>
                    <td>
                      <div className={styles.stockControl}>
                        <button
                          type="button"
                          className={styles.stepperBtn}
                          onClick={() => handleStockChange(p.id, -5)}
                          title="-5"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          className={styles.stepperBtn}
                          onClick={() => handleStockChange(p.id, -1)}
                          title="-1"
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
                          title="+1"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className={styles.stepperBtn}
                          onClick={() => handleStockChange(p.id, 5)}
                          title="+5"
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
        )}
      </div>

      <div className={styles.logSection}>
        <h2 className={styles.sectionTitle}>Recent Stock Adjustment Audit Logs</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Product</th>
              <th>Change</th>
              <th>New Level</th>
              <th>Reason</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice(0, 15).map((log) => (
              <tr key={log.id}>
                <td>
                  {new Date(log.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td style={{ fontWeight: 600 }}>{log.product?.name || 'Item'}</td>
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                    {log.reason}
                  </span>
                </td>
                <td style={{ opacity: 0.8 }}>{log.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
