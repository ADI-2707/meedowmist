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
    </div>
  );
}
