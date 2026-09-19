'use client';

import { Check, Clock, PackageCheck, Truck, Home, AlertOctagon, ExternalLink } from 'lucide-react';
import styles from './OrderTimeline.module.css';

interface OrderTimelineProps {
  status: string;
  trackingNumber?: string | null;
  courierPartner?: string | null;
  courierStatus?: string | null;
}

export function getCourierTrackingUrl(partner: string | null | undefined, trackingNumber: string): string {
  const p = (partner || '').toLowerCase();
  if (p.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(trackingNumber)}`;
  }
  if (p.includes('bluedart') || p.includes('blue dart')) {
    return `https://www.bluedart.com/tracking?trackNumber=${encodeURIComponent(trackingNumber)}`;
  }
  if (p.includes('shiprocket')) {
    return `https://shiprocket.co/tracking/${encodeURIComponent(trackingNumber)}`;
  }
  if (p.includes('dtdc')) {
    return `https://www.dtdc.in/tracking.asp?strCnno=${encodeURIComponent(trackingNumber)}`;
  }
  if (p.includes('post') || p.includes('indiapost')) {
    return `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${partner || 'courier'} tracking ${trackingNumber}`)}`;
}

export function OrderTimeline({
  status,
  trackingNumber,
  courierPartner,
  courierStatus,
}: OrderTimelineProps) {
  const normStatus = status.toUpperCase();

  if (normStatus === 'CANCELLED') {
    return (
      <div className={styles.timelineContainer}>
        <div className={styles.cancelledNotice}>
          <AlertOctagon size={18} />
          <span>This order was cancelled prior to dispatch and items have been restocked.</span>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Order Confirmed', icon: Clock },
    { key: 'PROCESSING', label: 'Crafting & Packing', icon: PackageCheck },
    { key: 'SHIPPED', label: 'In Transit', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  const statusIndexMap: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };

  const currentIndex = statusIndexMap[normStatus] ?? 0;
  const progressPercent = (currentIndex / (steps.length - 1)) * 100;

  const trackingUrl = trackingNumber ? getCourierTrackingUrl(courierPartner, trackingNumber) : null;

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.stepper}>
        <div className={styles.stepConnector}>
          <div
            className={styles.connectorProgress}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step.key} className={styles.stepItem}>
              <div
                className={`${styles.node} ${isCompleted ? styles.nodeCompleted : ''} ${
                  isActive ? styles.nodeActive : ''
                }`}
              >
                {isCompleted ? <Check size={16} /> : <Icon size={14} />}
              </div>
              <span
                className={`${styles.stepLabel} ${isActive || isCompleted ? styles.stepLabelActive : ''}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {trackingNumber && (
        <div className={styles.trackingCard}>
          <div className={styles.trackingInfo}>
            <Truck size={16} style={{ color: 'var(--color-gold, #B4903F)' }} />
            <span className={styles.partnerBadge}>{courierPartner || 'Courier'}</span>
            <span className={styles.trackingCode}>{trackingNumber}</span>
            {courierStatus && <span className={styles.courierNote}>({courierStatus})</span>}
          </div>

          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.trackLink}
            >
              Track Live Shipment
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
