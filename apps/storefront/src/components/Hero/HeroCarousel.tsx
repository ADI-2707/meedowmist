'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HERO_SLIDES, type HeroSlide } from '@/data/heroData';
import styles from './HeroCarousel.module.css';

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

export function HeroCarousel({
  slides = HERO_SLIDES,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const totalSlides = slides.length;
  const isInfinite = totalSlides > 1;

  const [currentIndex, setCurrentIndex] = useState(isInfinite ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const extendedSlides = useMemo(() => {
    if (!isInfinite) {
      return slides.map((s) => ({ ...s, uniqueKey: s.id, isClone: false }));
    }
    return [
      { ...slides[totalSlides - 1], uniqueKey: 'clone-start', isClone: true },
      ...slides.map((s) => ({ ...s, uniqueKey: s.id, isClone: false })),
      { ...slides[0], uniqueKey: 'clone-end', isClone: true },
    ];
  }, [slides, isInfinite, totalSlides]);

  const nextSlide = useCallback(() => {
    setIsTransitionEnabled(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitionEnabled(true);
    setCurrentIndex((prev) => prev - 1);
  }, []);

  const goToDot = useCallback(
    (dotIndex: number) => {
      setIsTransitionEnabled(true);
      setCurrentIndex(isInfinite ? dotIndex + 1 : dotIndex);
    },
    [isInfinite]
  );

  const handleTransitionEnd = useCallback(() => {
    if (!isInfinite) return;

    if (currentIndex >= totalSlides + 1) {
      setIsTransitionEnabled(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      setIsTransitionEnabled(false);
      setCurrentIndex(totalSlides);
    }
  }, [currentIndex, isInfinite, totalSlides]);

  useEffect(() => {
    if (!isTransitionEnabled) {
      const raf = requestAnimationFrame(() => {
        setIsTransitionEnabled(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitionEnabled]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides, autoPlayInterval, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const activeDot = isInfinite
    ? (currentIndex - 1 + totalSlides) % totalSlides
    : currentIndex;

  return (
    <div className={styles.wrapper}>
      <section
        className={styles.carousel}
        aria-roledescription="carousel"
        aria-label="Meadow Mist Collections"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div
          className={styles.slideTrack}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitionEnabled
              ? 'transform 700ms cubic-bezier(0.25, 1, 0.35, 1)'
              : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((slide, index) => {
            const isSlideActive = index === currentIndex;
            return (
              <div
                key={slide.uniqueKey}
                className={`${styles.slide} ${isSlideActive ? styles.slideActive : ''}`}
                aria-hidden={!isSlideActive}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${extendedSlides.length}: ${slide.headlinePre}`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={index === 1 || (!isInfinite && index === 0)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1440px) 92vw, 1380px"
                  className={styles.slideImage}
                />
                <div className={styles.overlay} />

                <div className={styles.content}>
                  <span className={styles.badge}>{slide.badge}</span>
                  <h2 className={styles.headline}>
                    {slide.headlinePre}{' '}
                    <span className={styles.script}>{slide.headlineScript}</span>{' '}
                    {slide.headlinePost}
                  </h2>
                  <p className={styles.subtext}>{slide.subtext}</p>
                  <div className={styles.ctas}>
                    <Link
                      href={slide.primaryCta.href}
                      className={styles.primaryCta}
                      tabIndex={isSlideActive ? 0 : -1}
                    >
                      {slide.primaryCta.label}
                    </Link>
                    {slide.secondaryCta && (
                      <Link
                        href={slide.secondaryCta.href}
                        className={styles.secondaryCta}
                        tabIndex={isSlideActive ? 0 : -1}
                      >
                        {slide.secondaryCta.label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalSlides > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Slide navigation">
            {slides.map((slide, index) => {
              const isActive = index === activeDot;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`${styles.dot} ${isActive ? styles.dotActive : ''}`}
                  onClick={() => goToDot(index)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default HeroCarousel;
