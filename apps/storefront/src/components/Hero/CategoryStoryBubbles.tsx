'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { STORY_BUBBLES, type StoryBubble } from '@/data/heroData';
import styles from './CategoryStoryBubbles.module.css';

interface CategoryStoryBubblesProps {
  bubbles?: StoryBubble[];
}

export default function CategoryStoryBubbles({
  bubbles = STORY_BUBBLES,
}: CategoryStoryBubblesProps) {
  return (
    <section className={styles.container} aria-label="Browse artisan collections">
      <div className={styles.scrollArea} role="list">
        {bubbles.map((bubble) => (
          <Link
            key={bubble.id}
            href={bubble.href}
            className={styles.bubbleItem}
            role="listitem"
            aria-label={`Browse ${bubble.label}`}
          >
            <div className={styles.imageRing}>
              <Image
                src={bubble.image}
                alt={bubble.label}
                width={66}
                height={66}
                className={styles.imageThumb}
              />
              {bubble.tag && <span className={styles.tag}>{bubble.tag}</span>}
            </div>
            <span className={styles.label}>{bubble.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
