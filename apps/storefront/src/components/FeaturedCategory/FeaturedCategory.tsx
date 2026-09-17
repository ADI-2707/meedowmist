import Link from 'next/link';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard/ProductCard';
import SectionReveal from '@/components/SectionReveal/SectionReveal';
import styles from './FeaturedCategory.module.css';

interface Props {
  title: string;
  eyebrow?: string;
  description?: string;
  href: string;
  products: Product[];
}

export default function FeaturedCategory({ title, eyebrow, description, href, products }: Props) {
  return (
    <section className={styles.section}>
      <SectionReveal>
        <div className={styles.header}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </SectionReveal>

      <div className={styles.grid}>
        {products.map((product, i) => (
          <SectionReveal key={product.id} delay={i * 0.1}>
            <ProductCard product={product} />
          </SectionReveal>
        ))}
      </div>

      <SectionReveal delay={0.3}>
        <div className={styles.cta}>
          <Link href={href} className={styles.ctaLink}>
            See all →
          </Link>
        </div>
      </SectionReveal>
    </section>
  );
}
