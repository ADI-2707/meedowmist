import React from 'react';
import { Truck, Leaf, Sparkles, ShieldCheck } from 'lucide-react';
import { TRUST_BADGES, type TrustBadge } from '@/data/heroData';
import styles from './HeroTrustStrip.module.css';

interface HeroTrustStripProps {
  badges?: TrustBadge[];
}

function renderTrustIcon(icon: TrustBadge['icon']) {
  switch (icon) {
    case 'truck':
      return <Truck size={20} aria-hidden="true" />;
    case 'leaf':
      return <Leaf size={20} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles size={20} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck size={20} aria-hidden="true" />;
    default:
      return <Sparkles size={20} aria-hidden="true" />;
  }
}

export function HeroTrustStrip({ badges = TRUST_BADGES }: HeroTrustStripProps) {
  return (
    <section className={styles.wrapper} aria-label="Meadow Mist Assurances">
      <div className={styles.grid}>
        {badges.map((badge) => (
          <div key={badge.id} className={styles.card}>
            <div className={styles.iconWrapper}>
              {renderTrustIcon(badge.icon)}
            </div>
            <div className={styles.textContainer}>
              <h3 className={styles.title}>{badge.title}</h3>
              <p className={styles.description}>{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
