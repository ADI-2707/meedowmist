import type { Metadata } from 'next';
import { getProducts } from '@/lib/getProducts';
import CategoryGrid from '@/components/CategoryGrid/CategoryGrid';
import SectionReveal from '@/components/SectionReveal/SectionReveal';
import BrushDivider from '@/components/BrushDivider/BrushDivider';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Shop Candles',
  description:
    'Browse all Meadow Mist hand-poured soy candles — ribbed pillars, wax art clusters, and floral discs. Filter by scent family or candle type.',
};

export default async function CandlesPage() {
  const candles = await getProducts('candle');

  return (
    <div className={styles.page}>
      <div className="container">
        <SectionReveal>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>Hand-poured · Soy Wax · Small Batches</p>
            <h1 className={styles.title}>Candles</h1>
            <p className={styles.subtitle}>
              Every candle is poured by hand in runs of eight or fewer.
              The wax, the wick, the botanicals — nothing is rushed.
            </p>
          </header>
        </SectionReveal>

        <BrushDivider />

        <CategoryGrid products={candles} type="candle" />
      </div>
    </div>
  );
}
