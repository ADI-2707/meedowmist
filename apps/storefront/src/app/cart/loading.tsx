import styles from '../loading.module.css';

export default function CartLoading() {
  return (
    <div className={styles.loadingPage}>
      <div className="container">
        <div style={{ marginBottom: '24px' }}>
          <div className={`${styles.skeleton} ${styles.titleLine1}`} style={{ width: '180px', height: '36px' }} />
        </div>
        <div className={styles.heroSkeleton}>
          <div className={styles.textSkeleton}>
            {[1, 2].map((n) => (
              <div key={n} style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                <div className={`${styles.skeleton}`} style={{ width: '80px', height: '80px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className={`${styles.skeleton}`} style={{ width: '60%', height: '18px' }} />
                  <div className={`${styles.skeleton}`} style={{ width: '40%', height: '14px' }} />
                </div>
              </div>
            ))}
          </div>
          <div className={`${styles.skeleton}`} style={{ width: '100%', height: '240px', borderRadius: '16px' }} />
        </div>
      </div>
    </div>
  );
}
