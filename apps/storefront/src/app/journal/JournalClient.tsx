'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { JournalArticle } from '@meadowmist/shared';
import styles from './page.module.css';

interface JournalClientProps {
  articles: JournalArticle[];
}

export default function JournalClient({ articles }: JournalClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Candle Care', 'Ceramics', 'Rituals', 'Gifting'];

  const filtered = selectedCategory === 'All'
    ? articles
    : articles.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <p className={styles.eyebrow}>The Studio Chronicle</p>
          <h1 className={styles.title}>Journal & Care Guides</h1>
          <p className={styles.subtitle}>
            Rituals, care recommendations for hand-poured soy wax, and glimpses into the rhythm of our ceramic wheel.
          </p>
        </header>

        <div className={styles.filterBar} role="tablist">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.filterBtn} ${selectedCategory === cat ? styles.activeFilter : ''}`}
              onClick={() => setSelectedCategory(cat)}
              role="tab"
              aria-selected={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {featured && (
          <Link href={`/journal/${featured.slug}`} className={styles.featuredCard}>
            <div className={styles.featuredImgWrapper}>
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                priority
                className={styles.featuredImg}
              />
            </div>
            <div className={styles.featuredContent}>
              <div className={styles.metaRow}>
                <span>{featured.category}</span>
                <span>·</span>
                <span>{featured.readTime}</span>
              </div>
              <h2 className={styles.featuredTitle}>{featured.title}</h2>
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              <span className={styles.readMoreLink}>
                Read Story &rarr;
              </span>
            </div>
          </Link>
        )}

        <div className={styles.grid}>
          {rest.map((article) => (
            <Link key={article.id} href={`/journal/${article.slug}`} className={styles.card}>
              <div className={styles.cardImgWrapper}>
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className={styles.cardImg}
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                  <span>{article.category}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className={styles.cardTitle}>{article.title}</h3>
                <p className={styles.cardExcerpt}>{article.excerpt}</p>
                <div className={styles.cardFooter}>
                  <span>Meadow Mist Studio</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
