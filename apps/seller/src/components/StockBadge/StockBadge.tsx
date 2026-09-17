import React from 'react';
import styles from './StockBadge.module.css';

export type BadgeStatus =
  | 'in-stock'
  | 'low-stock'
  | 'out-of-stock'
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface StockBadgeProps {
  status: BadgeStatus;
  label?: string;
}

export function StockBadge({ status, label }: StockBadgeProps) {
  const getStyleClass = () => {
    switch (status) {
      case 'in-stock':
        return styles.inStock;
      case 'low-stock':
        return styles.lowStock;
      case 'out-of-stock':
        return styles.outOfStock;
      case 'pending':
        return styles.pending;
      case 'confirmed':
        return styles.pending;
      case 'shipped':
        return styles.shipped;
      case 'delivered':
        return styles.delivered;
      case 'cancelled':
        return styles.cancelled;
      default:
        return styles.inStock;
    }
  };

  const getDefaultLabel = () => {
    switch (status) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <span className={`${styles.badge} ${getStyleClass()}`}>
      <span className={styles.dot} />
      {label || getDefaultLabel()}
    </span>
  );
}

export default StockBadge;
