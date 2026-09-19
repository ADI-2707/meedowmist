'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import styles from '../orders/orders.module.css';

interface EnquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  category: string;
  message: string;
  status: string;
  adminReply?: string | null;
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL' ? '/api/enquiries' : `/api/enquiries?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSelect = (e: EnquiryItem) => {
    setSelectedEnquiry(e);
    setReplyText(e.adminReply || '');
    setNewStatus(e.status);
  };

  const handleSaveReply = async () => {
    if (!selectedEnquiry) return;
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEnquiry.id,
          status: newStatus,
          adminReply: replyText,
        }),
      });
      if (res.ok) {
        alert('Enquiry updated successfully');
        fetchEnquiries();
        setSelectedEnquiry(null);
      }
    } catch {
      alert('Error updating enquiry');
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Support & Messages"
        title="Customer Enquiries"
        subtitle="Inbound requests from storefront contact forms, bespoke candle orders, and artisan partnerships."
      />

      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Enquiries</option>
          <option value="PENDING">Pending Attention</option>
          <option value="IN_REVIEW">In Review / Contacted</option>
          <option value="RESOLVED">Resolved / Completed</option>
        </select>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.tableCard}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>No enquiries found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Category</th>
                  <th>Message Preview</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedEnquiry?.id === item.id ? 'var(--color-canvas)' : undefined,
                    }}
                  >
                    <td>
                      <p style={{ fontWeight: 600, color: 'var(--color-forest)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.email}</p>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                        {item.message.slice(0, 60)}…
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.statusPill}
                        style={{
                          backgroundColor:
                            item.status === 'RESOLVED'
                              ? '#c6f6d5'
                              : item.status === 'IN_REVIEW'
                              ? '#e2e8f0'
                              : '#feebc8',
                          color:
                            item.status === 'RESOLVED'
                              ? '#22543d'
                              : item.status === 'IN_REVIEW'
                              ? '#2d3748'
                              : '#744210',
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          {selectedEnquiry ? (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Enquiry Details</h2>
              <div style={{ marginBottom: '16px', lineHeight: 1.5 }}>
                <p style={{ fontWeight: 700, color: 'var(--color-forest)' }}>{selectedEnquiry.name}</p>
                <p style={{ fontSize: '0.85rem' }}>Email: {selectedEnquiry.email}</p>
                {selectedEnquiry.phone && <p style={{ fontSize: '0.85rem' }}>Phone: {selectedEnquiry.phone}</p>}
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, marginTop: '4px' }}>
                  Topic: {selectedEnquiry.category}
                </p>
              </div>

              <div style={{ background: 'var(--color-canvas)', padding: '14px', borderRadius: '6px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '4px' }}>Message:</p>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedEnquiry.message}</p>
              </div>

              <div className={styles.controlField}>
                <label>Resolution Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="PENDING">PENDING</option>
                  <option value="IN_REVIEW">IN REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div className={styles.controlField}>
                <label>Internal Response Notes / Resolution Summary</label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Record what was communicated or resolved with the customer..."
                />
              </div>

              <button onClick={handleSaveReply} className={styles.saveBtn}>
                Save Response & Update Status
              </button>
            </div>
          ) : (
            <div className={styles.card} style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.6 }}>
              Select an enquiry from the list to view the full message and record replies.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
