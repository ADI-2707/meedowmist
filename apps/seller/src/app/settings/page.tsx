'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import styles from './settings.module.css';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Meadow Mist');
  const [contactEmail, setContactEmail] = useState('hello@meadowmist.in');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [shippingFlatRate, setShippingFlatRate] = useState('99');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1499');
  const [codEnabled, setCodEnabled] = useState(true);
  const [codFee, setCodFee] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const s = data.settings;
          if (s) {
            setStoreName(s.storeName || 'Meadow Mist');
            setContactEmail(s.contactEmail || 'hello@meadowmist.in');
            setContactPhone(s.contactPhone || '+91 98765 43210');
            setShippingFlatRate(String(s.shippingFlatRate ?? 99));
            setFreeShippingThreshold(String(s.freeShippingThreshold ?? 1499));
            setCodEnabled(s.codEnabled ?? true);
            setCodFee(String(s.codFee ?? 0));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          contactEmail,
          contactPhone,
          shippingFlatRate: Number(shippingFlatRate),
          freeShippingThreshold: Number(freeShippingThreshold),
          codEnabled,
          codFee: Number(codFee),
        }),
      });

      if (res.ok) {
        alert('Store and shipping settings updated successfully');
      } else {
        alert('Failed to update settings');
      }
    } catch {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading store settings...</div>;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Configuration"
        title="Store & Shipping Settings"
        subtitle="Manage merchant contact details, courier flat rates, free shipping rules, and payment gateways."
      />

      <form onSubmit={handleSave} className={styles.formCard}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>1. Store Profile & Brand</h2>
          <div className={styles.field}>
            <label className={styles.label}>Brand Name</label>
            <input
              className={styles.input}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Support & Concierge Email</label>
            <input
              type="email"
              className={styles.input}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Support Phone / WhatsApp</label>
            <input
              className={styles.input}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>2. Logistics & Delivery Surcharges</h2>

          <div className={styles.field}>
            <label className={styles.label}>Standard Shipping Charge (₹)</label>
            <input
              type="number"
              className={styles.input}
              value={shippingFlatRate}
              onChange={(e) => setShippingFlatRate(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Free Delivery Order Threshold (₹)</label>
            <input
              type="number"
              className={styles.input}
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>3. Payment Modes</h2>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="codEnabled"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
            />
            <label htmlFor="codEnabled" style={{ cursor: 'pointer', fontSize: '0.88rem' }}>
              Accept Cash on Delivery (COD)
            </label>
          </div>

          {codEnabled && (
            <div className={styles.field}>
              <label className={styles.label}>Extra COD Handling Convenience Fee (₹, 0 for Free COD)</label>
              <input
                type="number"
                className={styles.input}
                value={codFee}
                onChange={(e) => setCodFee(e.target.value)}
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className={styles.submitBtn}>
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}
