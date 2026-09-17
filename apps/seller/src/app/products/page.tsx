'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Search, Trash2, Edit } from 'lucide-react';
import styles from './products.module.css';

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  salePrice?: number | null;
  images: string;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  isActive: boolean;
  badge?: string | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Products load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or deactivate "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch {
      alert('Error deleting product');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Catalog</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Manage candles, ceramics, pricing, custom scents, and stock counts.
          </p>
        </div>

        <Link href="/products/new" className={styles.addBtn}>
          <PlusCircle size={16} />
          Create New Product
        </Link>
      </div>

      <div className={styles.filterBar}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.addBtn} style={{ padding: '8px 14px' }}>
            <Search size={14} />
          </button>
        </form>

        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="candle">Candles</option>
          <option value="ceramic">Ceramics</option>
        </select>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active / Published</option>
          <option value="INACTIVE">Inactive / Archived</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            No products match the selected filters.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                let img = '/images/products/sunflower-wax-cluster-yellow.jpg';
                try {
                  const imgs = JSON.parse(p.images);
                  if (Array.isArray(imgs) && imgs.length > 0) img = imgs[0];
                } catch {
                  img = p.images;
                }

                const isLow = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;
                const isOut = p.stockQuantity === 0;

                return (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productInfo}>
                        <div className={styles.thumb}>
                          <Image src={img} alt={p.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p className={styles.name}>{p.name}</p>
                          <p className={styles.slug}>slug: /{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {p.category} ({p.subCategory})
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</span>
                      {p.salePrice && (
                        <span style={{ marginLeft: '6px', color: '#c53030', textDecoration: 'line-through', fontSize: '0.75rem' }}>
                          ₹{p.salePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.stockBadge} ${
                          isOut ? styles.outStock : isLow ? styles.lowStock : styles.inStock
                        }`}
                      >
                        {isOut ? 'Out of Stock' : `${p.stockQuantity} in stock`}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: p.isActive ? '#2f855a' : '#a0aec0', fontWeight: 600 }}>
                        {p.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/products/${p.id}/edit`} className={styles.editBtn}>
                          <Edit size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className={styles.deleteBtn}
                        >
                          <Trash2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Delete
                        </button>
                      </div>
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
