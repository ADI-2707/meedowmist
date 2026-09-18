'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './TopLoader.module.css';

function TopLoaderBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startProgress = () => {
    clearTimer();
    setVisible(true);
    setProgress(25);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + 12;
        if (prev < 85) return prev + 4;
        return prev;
      });
    }, 160);
  };

  const completeProgress = () => {
    clearTimer();
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 180);
  };

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank'
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;

        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          startProgress();
        }
      } catch {}
    };

    const handleCustomStart = () => startProgress();
    const handleCustomDone = () => completeProgress();

    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('seller:loading:start', handleCustomStart);
    window.addEventListener('seller:loading:done', handleCustomDone);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('seller:loading:start', handleCustomStart);
      window.removeEventListener('seller:loading:done', handleCustomDone);
      clearTimer();
    };
  }, []);

  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.bar}
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      >
        <div className={styles.glow} />
      </div>
    </div>
  );
}

export function TopLoader() {
  return (
    <Suspense fallback={null}>
      <TopLoaderBar />
    </Suspense>
  );
}

export default TopLoader;
