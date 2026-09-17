import styles from '../loading.module.css';

export default function CeramicsLoading() {
  return (
    <div className={styles.loadingPage}>
      <div className="container">
        <div style={{ marginBottom: '24px' }}>
          <div className={`${styles.skeleton} ${styles.titleLine1}`} style={{ width: '220px', height: '36px' }} />
        </div>
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
