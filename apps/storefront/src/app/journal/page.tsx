import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Care guides, gifting ideas, and stories from the studio — the Meadow Mist journal.',
};

export default function JournalPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.stub}>
          <p className={styles.eyebrow}>Coming Soon</p>
          <h1 className={styles.title}>Journal</h1>
          <p className={styles.body}>
            Care guides (&ldquo;how to trim your wick&rdquo;), gifting guides, and notes from the studio.
            Coming soon — check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
