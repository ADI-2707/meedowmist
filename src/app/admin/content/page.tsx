'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Plus, Trash2, Save } from 'lucide-react';
import styles from '../products/products.module.css';

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badgeText?: string | null;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<'banners' | 'faqs' | 'about'>('banners');

  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    badgeText: '',
    imageUrl: '',
    linkUrl: '/candles',
  });
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: 'Candle Care',
  });

  const [aboutHeadline, setAboutHeadline] = useState('');
  const [aboutStory, setAboutStory] = useState('');
  const [aboutArtisanNote, setAboutArtisanNote] = useState('');
  const [savingAbout, setSavingAbout] = useState(false);

  const fetchData = async () => {
    try {
      const [banRes, faqRes, setRes] = await Promise.all([
        fetch('/api/content/banners'),
        fetch('/api/content/faqs'),
        fetch('/api/settings'),
      ]);

      if (banRes.ok) {
        const d = await banRes.json();
        setBanners(d.banners || []);
      }
      if (faqRes.ok) {
        const d = await faqRes.json();
        setFaqs(d.faqs || []);
      }
      if (setRes.ok) {
        const d = await setRes.json();
        if (d.settings) {
          setAboutHeadline(d.settings.aboutHeadline || '');
          setAboutStory(d.settings.aboutStory || '');
          setAboutArtisanNote(d.settings.aboutArtisanNote || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setNewBanner((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch {
      alert('Failed to upload image');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.imageUrl) {
      alert('Title and Image are required');
      return;
    }

    try {
      const res = await fetch('/api/content/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
      });
      if (res.ok) {
        setNewBanner({ title: '', subtitle: '', badgeText: '', imageUrl: '', linkUrl: '/candles' });
        fetchData();
      }
    } catch {
      alert('Failed to create banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await fetch(`/api/content/banners?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch {
      alert('Failed to delete');
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) {
      alert('Question and answer required');
      return;
    }

    try {
      const res = await fetch('/api/content/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaq),
      });
      if (res.ok) {
        setNewFaq({ question: '', answer: '', category: 'Candle Care' });
        fetchData();
      }
    } catch {
      alert('Failed to add FAQ');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await fetch(`/api/content/faqs?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch {
      alert('Failed to delete FAQ');
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAbout(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aboutHeadline,
          aboutStory,
          aboutArtisanNote,
        }),
      });
      if (res.ok) {
        alert('About Us content saved successfully');
      }
    } catch {
      alert('Failed to save story content');
    } finally {
      setSavingAbout(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Store Content Management (CMS)</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            Manage homepage banners, brand story copy, and customer FAQs.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-canvas-alt)', paddingBottom: '8px' }}>
        <button
          className={`${styles.addBtn} ${tab !== 'banners' ? styles.cancelLink : ''}`}
          style={{ background: tab === 'banners' ? 'var(--color-forest)' : 'none', color: tab === 'banners' ? '#fff' : 'var(--color-forest)' }}
          onClick={() => setTab('banners')}
        >
          Homepage Banners
        </button>
        <button
          className={`${styles.addBtn} ${tab !== 'faqs' ? styles.cancelLink : ''}`}
          style={{ background: tab === 'faqs' ? 'var(--color-forest)' : 'none', color: tab === 'faqs' ? '#fff' : 'var(--color-forest)' }}
          onClick={() => setTab('faqs')}
        >
          Frequently Asked Questions (FAQs)
        </button>
        <button
          className={`${styles.addBtn} ${tab !== 'about' ? styles.cancelLink : ''}`}
          style={{ background: tab === 'about' ? 'var(--color-forest)' : 'none', color: tab === 'about' ? '#fff' : 'var(--color-forest)' }}
          onClick={() => setTab('about')}
        >
          About Us & Brand Story
        </button>
      </div>

      {tab === 'banners' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div>
            <h2 className={styles.sectionTitle}>Active Storefront Banners</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {banners.map((b) => (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-gold-soft)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: '100px', height: '60px', position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
                    <Image src={b.imageUrl} alt={b.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{b.title}</p>
                    {b.subtitle && <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{b.subtitle}</p>}
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      Link: {b.linkUrl}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteBanner(b.id)} className={styles.deleteBtn}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateBanner} className={styles.formCard}>
            <h2 className={styles.sectionTitle}>+ Add New Banner</h2>
            <div className={styles.field}>
              <label className={styles.label}>Headline *</label>
              <input
                required
                className={styles.input}
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                placeholder="Handcrafted Soy Candles & Ceramic Décor"
              />
            </div>
            <div className={styles.field} style={{ marginTop: '12px' }}>
              <label className={styles.label}>Subheading</label>
              <input
                className={styles.input}
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                placeholder="Hand-poured in batches of eight in India"
              />
            </div>
            <div className={styles.field} style={{ marginTop: '12px' }}>
              <label className={styles.label}>Badge Text (e.g. New Collection)</label>
              <input
                className={styles.input}
                value={newBanner.badgeText}
                onChange={(e) => setNewBanner({ ...newBanner, badgeText: e.target.value })}
                placeholder="Spring Release"
              />
            </div>
            <div className={styles.field} style={{ marginTop: '12px' }}>
              <label className={styles.label}>Click-Through URL</label>
              <input
                className={styles.input}
                value={newBanner.linkUrl}
                onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                placeholder="/candles"
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label className={styles.label}>Banner Image</label>
              <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ marginTop: '6px' }} />
              {newBanner.imageUrl && (
                <div style={{ marginTop: '8px', width: '120px', height: '60px', position: 'relative' }}>
                  <Image src={newBanner.imageUrl} alt="Banner Preview" fill style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <button type="submit" disabled={uploadingBanner} className={styles.addBtn} style={{ marginTop: '20px' }}>
              <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Save Banner
            </button>
          </form>
        </div>
      )}

      {tab === 'faqs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div>
            <h2 className={styles.sectionTitle}>Current Store FAQs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((f) => (
                <div
                  key={f.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--color-gold-soft)',
                    borderRadius: '8px',
                    padding: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 700 }}>
                        {f.category}
                      </span>
                      <p style={{ fontWeight: 600, color: 'var(--color-forest)', margin: '4px 0' }}>{f.question}</p>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85 }}>{f.answer}</p>
                    </div>
                    <button onClick={() => handleDeleteFaq(f.id)} className={styles.deleteBtn}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateFaq} className={styles.formCard}>
            <h2 className={styles.sectionTitle}>+ Add New FAQ</h2>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
              >
                <option value="Candle Care">Candle Care</option>
                <option value="Materials">Materials & Safety</option>
                <option value="Shipping">Shipping & Packaging</option>
                <option value="Ordering">Ordering & Returns</option>
              </select>
            </div>
            <div className={styles.field} style={{ marginTop: '12px' }}>
              <label className={styles.label}>Question *</label>
              <input
                required
                className={styles.input}
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="e.g. How do I care for soy wax wicks?"
              />
            </div>
            <div className={styles.field} style={{ marginTop: '12px' }}>
              <label className={styles.label}>Answer *</label>
              <textarea
                required
                rows={4}
                className={styles.textarea}
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="Explain clearly in friendly artisan tone..."
              />
            </div>
            <button type="submit" className={styles.addBtn} style={{ marginTop: '20px' }}>
              <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Add FAQ
            </button>
          </form>
        </div>
      )}

      {tab === 'about' && (
        <form onSubmit={handleSaveAbout} className={styles.formCard} style={{ maxWidth: '700px' }}>
          <h2 className={styles.sectionTitle}>Edit Brand Story & Artisan Statement</h2>

          <div className={styles.field}>
            <label className={styles.label}>Story Headline</label>
            <input
              className={styles.input}
              value={aboutHeadline}
              onChange={(e) => setAboutHeadline(e.target.value)}
            />
          </div>

          <div className={styles.field} style={{ marginTop: '14px' }}>
            <label className={styles.label}>Origin & Philosophy (Displayed on Home & Our Story)</label>
            <textarea
              rows={5}
              className={styles.textarea}
              value={aboutStory}
              onChange={(e) => setAboutStory(e.target.value)}
            />
          </div>

          <div className={styles.field} style={{ marginTop: '14px' }}>
            <label className={styles.label}>The Making-Of Note (Displayed on product detail pages)</label>
            <textarea
              rows={4}
              className={styles.textarea}
              value={aboutArtisanNote}
              onChange={(e) => setAboutArtisanNote(e.target.value)}
            />
          </div>

          <button type="submit" disabled={savingAbout} className={styles.addBtn} style={{ marginTop: '20px' }}>
            <Save size={14} style={{ display: 'inline', marginRight: '6px' }} />
            {savingAbout ? 'Saving...' : 'Save Story Content'}
          </button>
        </form>
      )}
    </div>
  );
}
