import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingPage}>
      <div className="container">
        {/* Hero Skeleton */}
        <div className={styles.heroSkeleton}>
          <div className={styles.textSkeleton}>
            <div className={`${styles.skeleton} ${styles.eyebrow}`} />
            <div className={`${styles.skeleton} ${styles.titleLine1}`} />
            <div className={`${styles.skeleton} ${styles.titleLine2}`} />
            <div className={`${styles.skeleton} ${styles.subtext}`} />
            <div className={styles.btnRow}>
              <div className={`${styles.skeleton} ${styles.btn}`} />
              <div className={`${styles.skeleton} ${styles.btn}`} />
            </div>
          </div>
          <div className={`${styles.skeleton} ${styles.imageSkeleton}`} />
        </div>

        {/* Product Grid Skeleton */}
        <div className={styles.gridSkeleton}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={styles.cardSkeleton}>
              <div className={`${styles.skeleton} ${styles.cardImg}`} />
              <div className={styles.cardBody}>
                <div className={`${styles.skeleton} ${styles.cardMeta}`} />
                <div className={`${styles.skeleton} ${styles.cardTitle}`} />
                <div className={`${styles.skeleton} ${styles.cardDesc}`} />
                <div className={styles.cardFooter}>
                  <div className={`${styles.skeleton} ${styles.cardPrice}`} />
                  <div className={`${styles.skeleton} ${styles.cardAddBtn}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
