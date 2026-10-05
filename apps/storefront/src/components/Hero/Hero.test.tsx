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
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);
    const track = container.querySelector('[aria-roledescription="carousel"] > div') as HTMLElement;
    expect(track.style.transform).toBe('translateX(-100%)');

    expect(screen.getAllByText(HERO_SLIDES[0].badge).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Things made/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(HERO_SLIDES[0].headlineScript).length).toBeGreaterThan(0);
    expect(screen.getAllByText(HERO_SLIDES[0].subtext).length).toBeGreaterThan(0);
    expect(screen.getAllByText(HERO_SLIDES[0].primaryCta.label).length).toBeGreaterThan(0);
  });

  it('automatically advances slides with horizontal right-to-left slide transforms and infinite loop', () => {
    vi.useFakeTimers();
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={5000} />);
    const track = container.querySelector('[aria-roledescription="carousel"] > div') as HTMLElement;
    expect(track.style.transform).toBe('translateX(-100%)');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.style.transform).toBe('translateX(-200%)');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.style.transform).toBe('translateX(-300%)');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.style.transform).toBe('translateX(-400%)');

    act(() => {
      fireEvent.transitionEnd(track);
    });
    expect(track.style.transform).toBe('translateX(-100%)');
    expect(track.style.transition).toBe('none');

    vi.useRealTimers();
  });

  it('does not render manual chevron arrow buttons', () => {
    render(<HeroCarousel slides={HERO_SLIDES} />);
    expect(screen.queryByRole('button', { name: /next slide/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /previous slide/i })).toBeNull();
  });

  it('navigates to a specific slide when dot button is clicked', () => {
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);
    const track = container.querySelector('[aria-roledescription="carousel"] > div') as HTMLElement;

    const slide3Dot = screen.getByRole('tab', { name: /go to slide 3/i });
    fireEvent.click(slide3Dot);

    expect(track.style.transform).toBe('translateX(-300%)');
  });

  it('supports touch swipe gestures to navigate slides', () => {
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);
    const carouselSection = container.querySelector('[aria-roledescription="carousel"]');
    const track = container.querySelector('[aria-roledescription="carousel"] > div') as HTMLElement;
    expect(carouselSection).not.toBeNull();

    if (carouselSection) {
      fireEvent.touchStart(carouselSection, { touches: [{ clientX: 200 }] });
      fireEvent.touchMove(carouselSection, { touches: [{ clientX: 120 }] });
      fireEvent.touchEnd(carouselSection);

      expect(track.style.transform).toBe('translateX(-200%)');

      fireEvent.touchStart(carouselSection, { touches: [{ clientX: 100 }] });
      fireEvent.touchMove(carouselSection, { touches: [{ clientX: 180 }] });
      fireEvent.touchEnd(carouselSection);

      expect(track.style.transform).toBe('translateX(-100%)');
    }
  });

  it('navigates with keyboard arrow keys', () => {
    const { container } = render(<HeroCarousel slides={HERO_SLIDES} autoPlayInterval={10000} />);
    const carouselSection = container.querySelector('[aria-roledescription="carousel"]');
    const track = container.querySelector('[aria-roledescription="carousel"] > div') as HTMLElement;
    expect(carouselSection).not.toBeNull();

    if (carouselSection) {
      fireEvent.keyDown(carouselSection, { key: 'ArrowRight' });
      expect(track.style.transform).toBe('translateX(-200%)');

      fireEvent.keyDown(carouselSection, { key: 'ArrowLeft' });
      expect(track.style.transform).toBe('translateX(-100%)');
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
