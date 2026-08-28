import type { Metadata } from 'next';
import styles from '../journal/page.module.css';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Sign in to your Meadow Mist account.',
};

export default function AccountPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.stub}>
          <p className={styles.eyebrow}>Coming Soon</p>
          <h1 className={styles.title}>Account</h1>
          <p className={styles.body}>
            Order history, saved addresses, and wishlists — coming when we launch our full store.
          </p>
        </div>
      </div>
    </div>
  );
}
