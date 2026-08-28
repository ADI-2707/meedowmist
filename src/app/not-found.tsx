import Link from 'next/link';
import Image from 'next/image';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFoundPage}>
      <div className={`container ${styles.inner}`}>
        <Image
          src="/images/logo.jpg"
          alt="Meadow Mist Logo"
          width={80}
          height={80}
          className={styles.logoBadge}
        />
        <p className={styles.eyebrow}>404 — Page Not Found</p>
        <h1 className={styles.title}>This piece doesn&apos;t seem to exist.</h1>
        <p className={styles.message}>
          The page or product you&apos;re looking for has moved or hasn&apos;t been poured yet.
        </p>
        <div className={styles.ctas}>
          <Link href="/candles" className={styles.primaryBtn}>
            Shop Candles
          </Link>
          <Link href="/ceramics" className={styles.secondaryBtn}>
            Shop Ceramics
          </Link>
          <Link href="/" className={styles.ghostBtn}>
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
