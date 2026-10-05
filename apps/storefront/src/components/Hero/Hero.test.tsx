import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Hero from './Hero';
import { CategoryStoryBubbles } from './CategoryStoryBubbles';
import { HeroCarousel } from './HeroCarousel';
import { HeroTrustStrip } from './HeroTrustStrip';
import { STORY_BUBBLES, HERO_SLIDES, TRUST_BADGES } from '@/data/heroData';

describe('CategoryStoryBubbles Component', () => {
  it('renders all category bubbles with labels and links', () => {
    render(<CategoryStoryBubbles bubbles={STORY_BUBBLES} />);

    STORY_BUBBLES.forEach((bubble) => {
      expect(screen.getByText(bubble.label)).toBeDefined();
    });

    const candlesLink = screen.getByRole('listitem', { name: /browse soy pillars/i });
    expect(candlesLink.getAttribute('href')).toBe('/candles');
  });

  it('renders status tags on categories that specify one', () => {
    render(<CategoryStoryBubbles bubbles={STORY_BUBBLES} />);

    expect(screen.getByText('Bestseller')).toBeDefined();
    expect(screen.getByText('Artisan')).toBeDefined();
    expect(screen.getByText('Festive')).toBeDefined();
  });
});

describe('HeroCarousel Component', () => {
  it('renders the first slide initially', () => {
    render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);

    expect(screen.getByText(HERO_SLIDES[0].badge)).toBeDefined();
    expect(screen.getByText(/Things made/i)).toBeDefined();
    expect(screen.getByText(HERO_SLIDES[0].headlineScript)).toBeDefined();
    expect(screen.getByText(HERO_SLIDES[0].subtext)).toBeDefined();
    expect(screen.getByText(HERO_SLIDES[0].primaryCta.label)).toBeDefined();
  });

  it('automatically advances slides with horizontal right-to-left slide transforms', () => {
    vi.useFakeTimers();
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={5000} />);
    const track = container.querySelector('[aria-roledescription="carousel"] > div') as HTMLElement;
    expect(track.style.transform).toBe('translateX(-0%)');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.style.transform).toBe('translateX(-100%)');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.style.transform).toBe('translateX(-200%)');

    vi.useRealTimers();
  });

  it('does not render manual chevron arrow buttons', () => {
    render(<HeroCarousel slides={HERO_SLIDES} />);
    expect(screen.queryByRole('button', { name: /next slide/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /previous slide/i })).toBeNull();
  });

  it('navigates to a specific slide when dot button is clicked', () => {
    render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);

    const slide3Dot = screen.getByRole('tab', { name: /go to slide 3/i });
    fireEvent.click(slide3Dot);

    expect(screen.getByText(HERO_SLIDES[2].badge)).toBeDefined();
  });

  it('supports touch swipe gestures to navigate slides', () => {
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);
    const carouselSection = container.querySelector('[aria-roledescription="carousel"]');
    expect(carouselSection).not.toBeNull();

    if (carouselSection) {
      fireEvent.touchStart(carouselSection, { touches: [{ clientX: 200 }] });
      fireEvent.touchMove(carouselSection, { touches: [{ clientX: 120 }] });
      fireEvent.touchEnd(carouselSection);

      expect(screen.getByText(HERO_SLIDES[1].badge)).toBeDefined();

      fireEvent.touchStart(carouselSection, { touches: [{ clientX: 100 }] });
      fireEvent.touchMove(carouselSection, { touches: [{ clientX: 180 }] });
      fireEvent.touchEnd(carouselSection);

      expect(screen.getByText(HERO_SLIDES[0].badge)).toBeDefined();
    }
  });

  it('navigates with keyboard arrow keys', () => {
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);
    const carouselSection = container.querySelector('[aria-roledescription="carousel"]');
    expect(carouselSection).not.toBeNull();

    if (carouselSection) {
      fireEvent.keyDown(carouselSection, { key: 'ArrowRight' });
      expect(screen.getByText(HERO_SLIDES[1].badge)).toBeDefined();

      fireEvent.keyDown(carouselSection, { key: 'ArrowLeft' });
      expect(screen.getByText(HERO_SLIDES[0].badge)).toBeDefined();
    }
  });
});

describe('HeroTrustStrip Component', () => {
  it('renders all trust badges with title and description', () => {
    render(<HeroTrustStrip badges={TRUST_BADGES} />);

    TRUST_BADGES.forEach((badge) => {
      expect(screen.getByText(badge.title)).toBeDefined();
      expect(screen.getByText(badge.description)).toBeDefined();
    });
  });
});

describe('Hero Integrated Component', () => {
  it('orchestrates story bubbles, carousel, and trust strip within semantic header', () => {
    render(<Hero />);

    expect(
      screen.getByText('Meadow Mist — Handcrafted Candles & Ceramic Home Décor in Bilaspur')
    ).toBeDefined();

    expect(screen.getByRole('region', { name: /browse artisan collections/i })).toBeDefined();
    expect(screen.getByRole('region', { name: /meadow mist collections/i })).toBeDefined();
    expect(screen.getByRole('region', { name: /meadow mist assurances/i })).toBeDefined();
  });
});
