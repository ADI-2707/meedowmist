'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Search, Trash2, Edit } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StockBadge } from '@/components/StockBadge/StockBadge';
import { Pagination } from '@/components/Pagination/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 350);

  const fetchProducts = async (currentPage = page, currentLimit = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      params.set('page', String(currentPage));
      params.set('limit', String(currentLimit));

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error('Products load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, limit);
  }, [categoryFilter, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchProducts(page, limit);
  }, [page, limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <PageHeader
        eyebrow="Merchandise"
        title="Product Catalog"
        subtitle="Manage handcrafted candles, ceramics, custom scents, and pricing tiers."
        actions={
          <Link href="/products/new" className={styles.addBtn}>
            <PlusCircle size={16} />
            <span>Create New Product</span>
          </Link>
        }
      />

      <div className={styles.filterBar}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by product title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn} title="Search">
            <Search size={15} />
          </button>
        </form>

        <div className={styles.filterControls}>
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="candle">Candles Only</option>
            <option value="ceramic">Ceramics Only</option>
          </select>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active / Published</option>
            <option value="INACTIVE">Archived / Draft</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>Loading product catalog...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            No products match the selected criteria.
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Inventory Status</th>
                  <th>Listing</th>
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
                            <p className={styles.slug}>/{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {p.category} · {p.subCategory}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          {p.salePrice && (
                            <span style={{ color: '#c53030', textDecoration: 'line-through', fontSize: '0.75rem' }}>
                              ₹{p.salePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <StockBadge
                            status={isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'}
                            label={isOut ? 'Out of Stock' : `${p.stockQuantity} in stock`}
                          />
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.statusDot}
                          style={{
                            backgroundColor: p.isActive ? '#2f855a' : '#a0aec0',
                          }}
                        />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: p.isActive ? '#2f855a' : '#718096' }}>
                          {p.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link href={`/products/${p.id}/edit`} className={styles.editBtn}>
                            <Edit size={13} />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className={styles.deleteBtn}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
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
    </div>
  );
}
