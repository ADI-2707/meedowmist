'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  const prefersReduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-headline">
      <div className={`container ${styles.inner}`}>
        {/* Text side */}
        <motion.div
          className={styles.textCol}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p className={styles.eyebrow} variants={itemVariants}>
            Handcrafted · Soy Wax · Small Batches
          </motion.p>
          <motion.h1 id="hero-headline" className={styles.headline} variants={itemVariants}>
            Things made<br />
            <span className={styles.script}>by hand,</span><br />
            grown like something living.
          </motion.h1>
          <motion.p className={styles.subtext} variants={itemVariants}>
            Hand-poured candles and handmade ceramics — each piece finished
            differently, because no two hands move the same way.
          </motion.p>
          <motion.div className={styles.ctas} variants={itemVariants}>
            <Link href="/candles" id="hero-cta-candles" className={styles.ctaPrimary}>
              Shop Candles
            </Link>
            <Link href="/ceramics" id="hero-cta-ceramics" className={styles.ctaSecondary}>
              Shop Ceramics
            </Link>
          </motion.div>
        </motion.div>

        {/* Product image — floating hero */}
        <motion.div
          className={styles.imageCol}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          {/* Animated SVG tree linework behind the image */}
          <div className={styles.treeSvgWrapper} aria-hidden="true">
            <svg className={styles.treeSvg} viewBox="0 0 320 320" fill="none">
              <path
                className={styles.treePath}
                d="M160 300 L160 200 M160 200 C160 200 120 175 100 140 C80 105 100 80 125 95 C115 75 140 65 155 90 C150 70 168 60 178 82 C190 65 215 75 215 105 C215 140 160 200 160 200Z"
                stroke="var(--color-gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity="0.35"
              />
              <path
                className={styles.treePath}
                d="M160 200 C160 200 130 180 115 158 M160 200 C160 200 188 182 204 162"
                stroke="var(--color-gold)"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.25"
              />
            </svg>
          </div>

          {/* Blob background shape — used exactly once */}
          <div className={styles.blob} aria-hidden="true" />

          {/* The hero product */}
          <div
            className={styles.floatingImage}
            style={{ animation: prefersReduced ? 'none' : undefined }}
          >
            <Image
              src="/images/products/black-gold-lotus-tealight.jpg"
              alt="Black and gold lotus tealight holder — Meadow Mist signature piece"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 45vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              className={styles.productImage}
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className={styles.scrollLine} />
        <span className={styles.scrollText}>Scroll</span>
      </motion.div>
    </section>
  );
}
