'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Upload, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import styles from '../../products.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState<'candle' | 'ceramic'>('candle');
  const [subCategory, setSubCategory] = useState('pillar');
  const [images, setImages] = useState<string[]>([]);
  const [materials, setMaterials] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [colorFamily, setColorFamily] = useState('ivory');
  const [scentFamily, setScentFamily] = useState('floral');
  const [scentNotes, setScentNotes] = useState('');
  const [badge, setBadge] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [fragrances, setFragrances] = useState('');
  const [waxTones, setWaxTones] = useState('');
  const [sizes, setSizes] = useState('');
  const [allowGiftMessage, setAllowGiftMessage] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.product;
          if (p) {
            setName(p.name);
            setSlug(p.slug);
            setDescription(p.description);
            setPrice(String(p.price));
            setSalePrice(p.salePrice ? String(p.salePrice) : '');
            setCategory(p.category);
            setSubCategory(p.subCategory);

            try {
              setImages(JSON.parse(p.images));
            } catch {
              setImages([p.images]);
            }

            try {
              const m = JSON.parse(p.materials);
              setMaterials(Array.isArray(m) ? m.join(', ') : '');
            } catch {
              setMaterials('');
            }

            setDimensions(p.dimensions || '');
            setColorFamily(p.colorFamily || 'ivory');
            setScentFamily(p.scentFamily || 'floral');

            try {
              const s = JSON.parse(p.scentNotes || '[]');
              setScentNotes(Array.isArray(s) ? s.join(', ') : '');
            } catch {
              setScentNotes('');
            }

            setBadge(p.badge || '');
            setStockQuantity(String(p.stockQuantity));
            setLowStockThreshold(String(p.lowStockThreshold));
            setIsFeatured(Boolean(p.isFeatured));
            setIsActive(Boolean(p.isActive));

            try {
              const c = JSON.parse(p.customOptions || '{}');
              setFragrances(Array.isArray(c.fragrances) ? c.fragrances.join(', ') : '');
              setWaxTones(Array.isArray(c.waxTones) ? c.waxTones.join(', ') : '');
              setSizes(Array.isArray(c.sizes) ? c.sizes.join(', ') : '');
              setAllowGiftMessage(Boolean(c.allowGiftMessage));
            } catch {
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product for editing:', err);
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setImages((prev) => [...prev, data.url]);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Name and price are required');
      return;
    }

    setLoading(true);

    const materialsArray = materials.split(',').map((m) => m.trim()).filter(Boolean);
    const scentNotesArray = scentNotes.split(',').map((s) => s.trim()).filter(Boolean);

    const customOptions = {
      fragrances: fragrances.split(',').map((f) => f.trim()).filter(Boolean),
      waxTones: waxTones.split(',').map((w) => w.trim()).filter(Boolean),
      sizes: sizes.split(',').map((s) => s.trim()).filter(Boolean),
      allowGiftMessage,
    };

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          category,
          subCategory,
          images,
          materials: materialsArray,
          dimensions,
          colorFamily,
          scentFamily: category === 'candle' ? scentFamily : null,
          scentNotes: category === 'candle' ? scentNotesArray : [],
          badge: badge || null,
          customOptions,
          stockQuantity: Number(stockQuantity) || 0,
          lowStockThreshold: Number(lowStockThreshold) || 5,
          isFeatured,
          isActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/products');
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch {
      alert('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div>Loading product details...</div>;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Product Catalog"
        title={`Edit Product: ${name}`}
        subtitle="Update pricing, photography, dimensions, and custom scent notes."
        actions={
          <Link href="/products" className={styles.editBtn}>
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>1. Basic Details</h2>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.formFull}`}>
              <label className={styles.label}>Product Name *</label>
              <input
                required
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input
                className={styles.input}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Badge</label>
              <select
                className={styles.select}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              >
                <option value="">None</option>
                <option value="bestseller">Bestseller</option>
                <option value="new">New Release</option>
                <option value="limited">Limited Edition</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.formFull}`}>
              <label className={styles.label}>Description / Story</label>
              <textarea
                rows={4}
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>2. Pricing & Category</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value as 'candle' | 'ceramic')}
              >
                <option value="candle">Candle</option>
                <option value="ceramic">Ceramic Décor</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Subcategory</label>
              <input
                className={styles.input}
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Regular Price (₹) *</label>
              <input
                type="number"
                required
                className={styles.input}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Sale Price (₹, optional)</label>
              <input
                type="number"
                className={styles.input}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>3. Product Photos</h2>
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              id="upload-edit"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <label htmlFor="upload-edit" style={{ cursor: 'pointer' }}>
              <Upload size={24} style={{ display: 'block', margin: '0 auto 8px', color: 'var(--color-gold)' }} />
              <span style={{ fontWeight: 600, color: 'var(--color-forest)' }}>
                {uploading ? 'Uploading...' : '+ Upload Additional Photo'}
              </span>
            </label>
          </div>

          <div className={styles.imgPreviewGrid}>
            {images.map((imgUrl, i) => (
              <div key={i} className={styles.previewThumb}>
                <Image src={imgUrl} alt={`Photo ${i}`} fill style={{ objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>4. Attributes & Customisation</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Color Family</label>
              <select
                className={styles.select}
                value={colorFamily}
                onChange={(e) => setColorFamily(e.target.value)}
              >
                <option value="ivory">Ivory / Cream</option>
                <option value="clay">Clay / Terracotta</option>
                <option value="mauve">Mauve / Lavender</option>
                <option value="blush">Blush Pink</option>
                <option value="forest">Forest Moss</option>
                <option value="gold">Amber Gold</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Scent Family</label>
              <select
                className={styles.select}
                value={scentFamily}
                onChange={(e) => setScentFamily(e.target.value)}
              >
                <option value="floral">Floral</option>
                <option value="woody">Woody & Earthy</option>
                <option value="fresh">Fresh & Herbal</option>
                <option value="spice">Warm Spice & Amber</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.formFull}`}>
              <label className={styles.label}>Scent Notes (comma separated)</label>
              <input
                className={styles.input}
                value={scentNotes}
                onChange={(e) => setScentNotes(e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.formFull}`}>
              <label className={styles.label}>Fragrance Choices</label>
              <input
                className={styles.input}
                value={fragrances}
                onChange={(e) => setFragrances(e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.formFull}`}>
              <label className={styles.label}>Wax / Glaze Tones</label>
              <input
                className={styles.input}
                value={waxTones}
                onChange={(e) => setWaxTones(e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.formFull}`}>
              <label className={styles.label}>Available Sizes</label>
              <input
                className={styles.input}
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
              />
            </div>

            <div className={styles.field} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="allowGiftEdit"
                checked={allowGiftMessage}
                onChange={(e) => setAllowGiftMessage(e.target.checked)}
              />
              <label htmlFor="allowGiftEdit" style={{ cursor: 'pointer' }}>Allow gift note requests</label>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>5. Stock & Publishing</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>In-Stock Units *</label>
              <input
                type="number"
                required
                className={styles.input}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Low Stock Alert Threshold</label>
              <input
                type="number"
                className={styles.input}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </div>

            <div className={styles.field} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="isFeaturedEdit"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <label htmlFor="isFeaturedEdit" style={{ cursor: 'pointer' }}>Feature on Homepage</label>
            </div>

            <div className={styles.field} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActiveEdit" style={{ cursor: 'pointer' }}>Product is Active / Published</label>
            </div>
          </div>
        </div>

        <div className={styles.submitRow}>
          <button type="submit" disabled={loading} className={styles.addBtn}>
            {loading ? 'Saving Changes...' : 'Save Product Changes'}
          </button>
          <Link href="/products" className={styles.cancelLink}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
