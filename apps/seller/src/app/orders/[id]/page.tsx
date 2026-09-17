'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StockBadge } from '@/components/StockBadge/StockBadge';
import styles from '../orders.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  subtotal: number;
  shippingCharges: number;
  discountAmount: number;
  totalAmount: number;
  promoCode?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  paymentRef?: string | null;
  refundedAmount: number;
  refundReason?: string | null;
  cancellationReason?: string | null;
  returnReason?: string | null;
  returnStatus?: string | null;
  trackingNumber?: string | null;
  courierPartner?: string | null;
  courierStatus?: string | null;
  shippingAddress: string;
  customerNotes?: string | null;
  user?: {
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  items: {
    id: string;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    selectedFragrance?: string | null;
    selectedColor?: string | null;
    selectedSize?: string | null;
    customNotes?: string | null;
    lineTotal: number;
  }[];
}

export default function AdminOrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [courierStatus, setCourierStatus] = useState('');

  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        const o = data.order;
        setOrder(o);
        setOrderStatus(o.status);
        setPaymentStatus(o.paymentStatus);
        setTrackingNumber(o.trackingNumber || '');
        setCourierPartner(o.courierPartner || 'Delhivery');
        setCourierStatus(o.courierStatus || 'Processing');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: orderStatus,
          paymentStatus,
        }),
      });
      if (res.ok) {
        alert('Order status updated successfully');
        fetchOrder();
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleUpdateCourier = async () => {
    try {
      const res = await fetch(`/api/orders/${id}/courier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          courierPartner,
          courierStatus,
        }),
      });
      if (res.ok) {
        alert('Courier tracking details saved');
        fetchOrder();
      }
    } catch {
      alert('Failed to update tracking');
    }
  };

  const handleProcessRefund = async () => {
    if (!refundAmount || Number(refundAmount) <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundedAmount: Number(refundAmount),
          refundReason,
          returnStatus: 'COMPLETED',
        }),
      });
      if (res.ok) {
        alert('Refund recorded successfully');
        fetchOrder();
      }
    } catch {
      alert('Failed to record refund');
    }
  };

  if (loading || !order) {
    return <div>Loading order details...</div>;
  }

  let address: Record<string, string> = {};
  try {
    address = JSON.parse(order.shippingAddress);
  } catch {
    address = {};
  }

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Order Fulfillment"
        title={`Order #${order.orderNumber}`}
        subtitle={`Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StockBadge status={order.status.toLowerCase() as any} />
            <Link href="/orders" className={styles.viewBtn}>
              <ArrowLeft size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Back to Orders
            </Link>
          </div>
        }
      />

      <div className={styles.detailGrid}>
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Ordered Handcrafted Pieces</h2>
            {order.items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.itemThumb}>
                  <Image src={item.productImage} alt={item.productName} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.productName}</p>
                  <p className={styles.itemMeta}>
                    Qty: {item.quantity} · Unit Price: ₹{item.unitPrice.toLocaleString('en-IN')}
                  </p>
                  {item.selectedFragrance && (
                    <p className={styles.itemMeta}>Scent: {item.selectedFragrance}</p>
                  )}
                  {item.selectedColor && (
                    <p className={styles.itemMeta}>Shade: {item.selectedColor}</p>
                  )}
                  {item.customNotes && (
                    <p className={styles.itemMeta} style={{ color: 'var(--color-gold)', fontWeight: 600 }}>
                      Note: &ldquo;{item.customNotes}&rdquo;
                    </p>
                  )}
                </div>
                <p className={styles.itemPrice}>₹{item.lineTotal.toLocaleString('en-IN')}</p>
              </div>
            ))}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-canvas-alt)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>Shipping Charges</span>
                <span>{order.shippingCharges === 0 ? 'FREE' : `₹${order.shippingCharges}`}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#2f855a' }}>
                  <span>Discount ({order.promoCode})</span>
                  <span>−₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1px solid var(--color-gold-soft)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-forest)' }}>
                <span>Total Amount</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Customer & Delivery Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-forest)' }}>Customer Details</p>
                <p>{order.user?.name || address.fullName || 'Customer'}</p>
                <p>{order.user?.email}</p>
                <p>Phone: {order.user?.phone || address.phone || '—'}</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--color-forest)' }}>Shipping Destination</p>
                <p>{address.fullName}</p>
                <p>{address.streetAddress}{address.apartment ? `, ${address.apartment}` : ''}</p>
                <p>{address.city}, {address.state} - {address.postalCode}</p>
                <p>Country: {address.country || 'India'}</p>
              </div>
            </div>

            {order.customerNotes && (
              <div style={{ marginTop: '16px', background: 'var(--color-canvas)', padding: '12px', borderRadius: '4px' }}>
                <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-gold)' }}>Customer Delivery Instruction:</p>
                <p style={{ fontSize: '0.85rem' }}>{order.customerNotes}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Fulfillment Status</h2>
            <div className={styles.controlField}>
              <label>Order Lifecycle State</label>
              <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                <option value="PENDING">PENDING (Awaiting preparation)</option>
                <option value="PROCESSING">PROCESSING (Poured & Packing)</option>
                <option value="SHIPPED">SHIPPED (In Transit)</option>
                <option value="DELIVERED">DELIVERED (Doorstep Handover)</option>
                <option value="CANCELLED">CANCELLED (Restock Inventory)</option>
              </select>
            </div>

            <div className={styles.controlField}>
              <label>Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
                <option value="PENDING">PENDING (e.g. COD unpaid)</option>
                <option value="PAID">PAID (Online verified / Cash collected)</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <button onClick={handleUpdateStatus} className={styles.saveBtn}>
              <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Update Status
            </button>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Courier & Shipment Tracking</h2>
            <div className={styles.controlField}>
              <label>Courier Partner</label>
              <select value={courierPartner} onChange={(e) => setCourierPartner(e.target.value)}>
                <option value="Delhivery">Delhivery</option>
                <option value="Bluedart">Blue Dart Express</option>
                <option value="Shiprocket">Shiprocket</option>
                <option value="DTDC">DTDC</option>
                <option value="IndiaPost">India Post Speed Post</option>
              </select>
            </div>

            <div className={styles.controlField}>
              <label>Air Waybill (AWB) / Tracking Number</label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DEL123456789IN"
              />
            </div>

            <div className={styles.controlField}>
              <label>Courier Status Note</label>
              <input
                value={courierStatus}
                onChange={(e) => setCourierStatus(e.target.value)}
                placeholder="e.g. Out for Delivery Mumbai Hub"
              />
            </div>

            <button onClick={handleUpdateCourier} className={styles.saveBtn}>
              <Truck size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Save Courier Tracking
            </button>
          </div>

          {(order.returnStatus === 'REQUESTED' || order.cancellationReason || order.returnReason) && (
            <div className={styles.card} style={{ borderColor: '#fbd38d' }}>
              <h2 className={styles.cardTitle} style={{ color: '#c53030' }}>
                <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Returns & Cancellations
              </h2>

              {order.cancellationReason && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>Cancellation Reason:</p>
                  <p style={{ fontSize: '0.85rem' }}>{order.cancellationReason}</p>
                </div>
              )}

              {order.returnReason && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>Return Request Reason:</p>
                  <p style={{ fontSize: '0.85rem' }}>{order.returnReason}</p>
                  <p style={{ fontSize: '0.8rem', color: '#c53030', fontWeight: 600 }}>
                    Status: {order.returnStatus}
                  </p>
                </div>
              )}

              <div className={styles.controlField}>
                <label>Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Max ₹${order.totalAmount}`}
                />
              </div>

              <div className={styles.controlField}>
                <label>Refund Reason</label>
                <input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Damaged in transit / Customer return approved"
                />
              </div>

              <button onClick={handleProcessRefund} className={styles.saveBtn} style={{ backgroundColor: '#c53030' }}>
                Process & Record Refund
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
