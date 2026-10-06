import React from 'react';
import { Sparkles, Palette, PackageCheck, ShieldCheck } from 'lucide-react';
import styles from './TrustPillars.module.css';

const PILLARS = [
  {
    icon: Sparkles,
    title: '100% Pure Soy Wax',
    description: 'Clean burning, non-toxic, and infused with phthalate-free fragrances and pure cotton wicks.',
  },
  {
    icon: Palette,
    title: 'Small-Batch Handcrafted',
    description: 'Thrown, trimmed, glazed, and poured in micro-runs. Every single piece is truly one-of-a-kind.',
  },
  {
    icon: PackageCheck,
    title: 'Zero-Plastic Packaging',
    description: 'Mindfully wrapped in recyclable honeycomb paper and biodegradable protective cushioning.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe Transit Guarantee',
    description: 'Fragile ceramics and candles packed with care. Instant, hassle-free replacement if damaged.',
  },
];

export default function TrustPillars() {
  return (
    <section className={styles.section} aria-label="Our Core Commitments">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.eyebrow}>The Meadow Mist Promise</span>
          <h2 className={styles.title}>Artisan Quality, Thoughtful Living</h2>
        </div>
        <div className={styles.grid}>
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={styles.card}>
                <div className={styles.iconWrapper}>
                  <Icon className={styles.icon} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
