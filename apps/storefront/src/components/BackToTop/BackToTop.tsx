'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';
import styles from './BackToTop.module.css';

export default function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={styles.button}
      aria-label="Back to top of page"
    >
      <span className={styles.text}>Back to top</span>
      <ArrowUp className={styles.icon} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
