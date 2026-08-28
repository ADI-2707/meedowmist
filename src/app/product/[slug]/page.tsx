import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug, getRelatedProducts, getAllSlugs } from '@/lib/getProducts';
import PriceTag from '@/components/PriceTag/PriceTag';
import ScentBadge from '@/components/ScentBadge/ScentBadge';
import FeaturedCategory from '@/components/FeaturedCategory/FeaturedCategory';
import BrushDivider from '@/components/BrushDivider/BrushDivider';
import AddToCartButton from './AddToCartButton';
import styles from './page.module.css';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.story.slice(0, 155),
    openGraph: {
      title: `${product.name} | Meadow Mist`,
      description: product.story.slice(0, 155),
      images: [{ url: product.images[0], width: 800, height: 600, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.slug, product.category, 3);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Product main layout */}
        <div className={styles.productGrid}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                className={styles.img}
              />
            </div>
          </div>

          {/* Info panel */}
          <div className={styles.info}>
            {/* Badges */}
            <div className={styles.badgeRow}>
              {product.badge && (
                <span className={`${styles.badge} ${styles[`badge-${product.badge}`]}`}>
                  {product.badge === 'bestseller' ? 'Bestseller' : product.badge === 'new' ? 'New' : 'Limited'}
                </span>
              )}
              <ScentBadge
                family={product.scentFamily ?? product.subCategory}
                colorFamily={product.colorFamily}
              />
            </div>

            <h1 className={styles.name}>{product.name}</h1>

            <PriceTag price={product.price} salePrice={product.salePrice} />

            {/* Story */}
            <p className={styles.story}>{product.story}</p>

            {/* Scent notes */}
            {product.scentNotes && product.scentNotes.length > 0 && (
              <div className={styles.scentNotes}>
                <p className={styles.detailLabel}>Scent Notes</p>
                <p className={styles.scentList}>{product.scentNotes.join(' · ')}</p>
              </div>
            )}

            {/* Materials */}
            <div className={styles.materials}>
              <p className={styles.detailLabel}>Materials</p>
              <ul className={styles.materialList}>
                {product.materials.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Dimensions */}
            {product.dimensions && (
              <div className={styles.dimensions}>
                <p className={styles.detailLabel}>Dimensions</p>
                <p>{product.dimensions}</p>
              </div>
            )}

            {/* The making-of note */}
            <div className={styles.makingOf}>
              <p className={styles.makingOfLabel}>The making of</p>
              <p className={styles.makingOfText}>
                Each piece is made in small batches — the variations in texture, glaze,
                and finish are a feature, not a flaw. Your piece will be similar to
                the photographs, and deliberately not identical.
              </p>
            </div>

            {/* CTA */}
            <div className={styles.ctaRow}>
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <>
            <BrushDivider />
            <FeaturedCategory
              title="You might also like"
              href={product.category === 'candle' ? '/candles' : '/ceramics'}
              products={related}
            />
          </>
        )}
      </div>
    </div>
  );
}
