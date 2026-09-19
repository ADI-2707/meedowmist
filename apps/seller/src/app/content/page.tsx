'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Save, Layers } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import styles from './content.module.css';

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

interface JournalCMSItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  isPublished: boolean;
  publishedAt: string;
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<'banners' | 'faqs' | 'about' | 'journal'>('banners');

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
  const [articles, setArticles] = useState<JournalCMSItem[]>([]);

  const fetchData = async () => {
    try {
      const [banRes, faqRes, setRes, jourRes] = await Promise.all([
        fetch('/api/content/banners'),
        fetch('/api/content/faqs'),
        fetch('/api/settings'),
        fetch('/api/content/journal'),
      ]);

      if (jourRes.ok) {
        const d = await jourRes.json();
        setArticles(d.articles || []);
      }

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
      alert('Headline and image required');
      return;
    }

    try {
      const res = await fetch('/api/content/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
      });

      if (res.ok) {
        setNewBanner({
          title: '',
          subtitle: '',
          badgeText: '',
          imageUrl: '',
          linkUrl: '/candles',
        });
        fetchData();
      } else {
        alert('Failed to save banner');
      }
    } catch {
      alert('Error saving banner');
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
      <PageHeader
        eyebrow="Content Management (CMS)"
        title="Storefront Content"
        subtitle="Manage homepage billboard banners, artisan brand stories, and customer FAQs."
      />

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'banners' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('banners')}
        >
          Homepage Banners
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'faqs' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('faqs')}
        >
          Customer FAQs
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'about' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('about')}
        >
          About Us & Brand Story
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'journal' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('journal')}
        >
          Journal & Care Guides
        </button>
      </div>

      {tab === 'banners' && (
        <div className={styles.splitGrid}>
          <div>
            <h2 className={styles.sectionTitle}>Active Storefront Banners</h2>
            <div className={styles.bannerList}>
              {banners.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', opacity: 0.7 }}>
                  No billboard banners created yet.
                </div>
              ) : (
                banners.map((b) => (
                  <div key={b.id} className={styles.bannerCard}>
                    <div className={styles.bannerImgWrap}>
                      <Image src={b.imageUrl} alt={b.title} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className={styles.bannerBody}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p className={styles.bannerTitle}>{b.title}</p>
                          {b.subtitle && <p className={styles.bannerSub}>{b.subtitle}</p>}
                          <p className={styles.bannerMeta}>Link: {b.linkUrl}</p>
                        </div>
                        <button onClick={() => handleDeleteBanner(b.id)} className={styles.deleteBtn}>
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleCreateBanner} className={styles.card}>
            <h2 className={styles.sectionTitle}>Add New Billboard Banner</h2>
            <div className={styles.field}>
              <label className={styles.label}>Banner Headline *</label>
              <input
                required
                className={styles.input}
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                placeholder="Handcrafted Soy Candles & Ceramic Décor"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Subheading</label>
              <input
                className={styles.input}
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                placeholder="Hand-poured in micro-batches in India"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Eyebrow Badge (Optional)</label>
              <input
                className={styles.input}
                value={newBanner.badgeText}
                onChange={(e) => setNewBanner({ ...newBanner, badgeText: e.target.value })}
                placeholder="Spring Collection"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Call to Action URL</label>
              <input
                className={styles.input}
                value={newBanner.linkUrl}
                onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                placeholder="/candles"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Banner Image (Upload)</label>
              <input type="file" accept="image/*" onChange={handleBannerUpload} />
              {newBanner.imageUrl && (
                <div style={{ marginTop: '8px', width: '100%', height: '80px', position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
                  <Image src={newBanner.imageUrl} alt="Banner Preview" fill style={{ objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <button type="submit" disabled={uploadingBanner} className={styles.submitBtn}>
              <Plus size={14} />
              <span>{uploadingBanner ? 'Uploading...' : 'Save Banner'}</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'faqs' && (
        <div className={styles.splitGrid}>
          <div>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div>
              {faqs.length === 0 ? (
                <div className={styles.card} style={{ textAlign: 'center', opacity: 0.7 }}>
                  No FAQs added yet.
                </div>
              ) : (
                faqs.map((f) => (
                  <div key={f.id} className={styles.faqItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div>
                        <span className={styles.faqCat}>{f.category}</span>
                        <p className={styles.faqQ}>{f.question}</p>
                        <p className={styles.faqA}>{f.answer}</p>
                      </div>
                      <button onClick={() => handleDeleteFaq(f.id)} className={styles.deleteBtn}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleCreateFaq} className={styles.card}>
            <h2 className={styles.sectionTitle}>Add New FAQ Item</h2>
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
            <div className={styles.field}>
              <label className={styles.label}>Question *</label>
              <input
                required
                className={styles.input}
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="e.g. How do I care for soy wax wicks?"
              />
            </div>
            <div className={styles.field}>
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
            <button type="submit" className={styles.submitBtn}>
              <Plus size={14} />
              <span>Add FAQ</span>
            </button>
          </form>
        </div>
      )}

      {tab === 'about' && (
        <form onSubmit={handleSaveAbout} className={styles.card} style={{ maxWidth: '720px' }}>
          <h2 className={styles.sectionTitle}>Edit Brand Story & Artisan Statement</h2>

          <div className={styles.field}>
            <label className={styles.label}>Story Headline</label>
            <input
              className={styles.input}
              value={aboutHeadline}
              onChange={(e) => setAboutHeadline(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Origin & Philosophy (Displayed on Home & Our Story)</label>
            <textarea
              rows={5}
              className={styles.textarea}
              value={aboutStory}
              onChange={(e) => setAboutStory(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>The Making-Of Note (Displayed on product detail pages)</label>
            <textarea
              rows={4}
              className={styles.textarea}
              value={aboutArtisanNote}
              onChange={(e) => setAboutArtisanNote(e.target.value)}
            />
          </div>

          <button type="submit" disabled={savingAbout} className={styles.submitBtn}>
            <Save size={14} />
            <span>{savingAbout ? 'Saving...' : 'Save Story Content'}</span>
          </button>
        </form>
      )}

      {tab === 'journal' && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Studio Journal & Care Guide Articles</h2>
          <div style={{ overflowX: 'auto', marginTop: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f7fafc' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4a5568' }}>Article Title</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4a5568' }}>Category</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4a5568' }}>Read Time</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4a5568' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4a5568' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#2d3748' }}>
                      {art.title}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#718096' }}>
                      {art.category}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#718096' }}>
                      {art.readTime}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: art.isPublished ? '#c6f6d5' : '#fed7d7',
                          color: art.isPublished ? '#22543d' : '#742a2a',
                        }}
                      >
                        {art.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/content/journal', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: art.id, isPublished: !art.isPublished }),
                            });
                            if (res.ok) {
                              setArticles((prev) =>
                                prev.map((a) => (a.id === art.id ? { ...a, isPublished: !art.isPublished } : a))
                              );
                            }
                          } catch {
                            alert('Failed to update status');
                          }
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #e2e8f0',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        {art.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
