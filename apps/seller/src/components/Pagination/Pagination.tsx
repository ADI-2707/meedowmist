'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50],
}) => {
  if (totalItems <= 0 && totalPages <= 1) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(totalItems, page * limit);

  const renderPageButtons = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('dots-1');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < totalPages - 2) pages.push('dots-2');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (typeof p === 'string') {
        return (
          <span key={`dots-${idx}`} className={styles.ellipsis}>
            ...
          </span>
        );
      }

      const isActive = p === page;
      return (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`${styles.pageButton} ${isActive ? styles.activePage : ''}`}
          aria-label={`Page ${p}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <nav className={styles.container} aria-label="Pagination Navigation">
      <div className={styles.leftSection}>
        <span className={styles.infoText}>
          Showing {startItem}-{endItem} of {totalItems}
        </span>
        {onLimitChange && (
          <div className={styles.limitSelectWrapper}>
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className={styles.select}
              aria-label="Items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={styles.navButton}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <div className={styles.pagesList}>{renderPageButtons()}</div>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={styles.navButton}
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
};
