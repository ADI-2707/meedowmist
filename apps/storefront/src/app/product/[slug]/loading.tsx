import styles from '../../loading.module.css';

export default function ProductLoading() {
  return (
    <div className={styles.loadingPage}>
      <div className="container">
        <div className={styles.heroSkeleton}>
          <div className={`${styles.skeleton} ${styles.imageSkeleton}`} style={{ height: '480px' }} />
          <div className={styles.textSkeleton}>
            <div className={`${styles.skeleton} ${styles.eyebrow}`} />
            <div className={`${styles.skeleton} ${styles.titleLine1}`} style={{ height: '36px' }} />
            <div className={`${styles.skeleton} ${styles.subtext}`} style={{ height: '60px' }} />
            <div className={`${styles.skeleton} ${styles.subtext}`} style={{ height: '80px', marginTop: '16px' }} />
            <div className={`${styles.skeleton} ${styles.btn}`} style={{ width: '100%', height: '52px', marginTop: '24px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
