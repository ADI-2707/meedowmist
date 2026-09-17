import type { Metadata } from 'next';
import { getProducts } from '@/lib/getProducts';
import CategoryGrid from '@/components/CategoryGrid/CategoryGrid';
import SectionReveal from '@/components/SectionReveal/SectionReveal';
import BrushDivider from '@/components/BrushDivider/BrushDivider';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Shop Ceramics',
  description:
    'Browse all Meadow Mist handmade ceramics — lotus bowls, ribbed trinket boxes, fishnet planters, and tealight holders. Each piece hand-formed and glazed.',
};

export default async function CeramicsPage() {
  const ceramics = await getProducts('ceramic');

  return (
    <div className={styles.page}>
      <div className="container">
        <SectionReveal>
          <header className={styles.pageHeader}>
            <p className={styles.eyebrow}>Handmade · Wheel-thrown · Hand-glazed</p>
            <h1 className={styles.title}>Ceramics</h1>
            <p className={styles.subtitle}>
              Lotus bowls, trinket boxes, planters — every piece hand-formed,
              glazed, and fired. Objects made to be touched.
            </p>
          </header>
        </SectionReveal>

        <BrushDivider />

        <CategoryGrid products={ceramics} type="ceramic" />
      </div>
    </div>
  );
}
