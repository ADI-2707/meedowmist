'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './error.module.css';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Runtime error caught by root boundary:', error);
  }, [error]);

  return (
    <div className={styles.errorPage}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.iconWrapper}>
          <Image
            src="/images/logo.jpg"
            alt="Meadow Mist Logo"
            width={72}
            height={72}
            className={styles.logoBadge}
          />
        </div>
        <p className={styles.eyebrow}>Temporary Interruption</p>
        <h1 className={styles.title}>Something went wrong.</h1>
        <p className={styles.message}>
          We couldn&apos;t load this section right now. It might be a momentary connection issue.
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={() => reset()} className={styles.retryBtn}>
            Try Again
          </button>
          <Link href="/" className={styles.homeLink}>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
