export interface HeroSlide {
  id: string;
  badge: string;
  headlinePre: string;
  headlineScript: string;
  headlinePost: string;
  subtext: string;
  image: string;
  alt: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
}

export interface StoryBubble {
  id: string;
  label: string;
  href: string;
  image: string;
  tag?: string;
}

export interface TrustBadge {
  id: string;
  icon: 'truck' | 'leaf' | 'sparkles' | 'shield';
  title: string;
  description: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-studio',
    badge: 'Bilaspur Studio · Handcrafted In Small Batches',
    headlinePre: 'Things made',
    headlineScript: 'by hand,',
    headlinePost: 'grown like something living.',
    subtext: 'Hand-poured pure soy wax candles and wheel-thrown ceramics finished with botanical intention in Bilaspur.',
    image: '/images/hero/banners/banner-bilaspur-studio.jpg',
    alt: 'Handcrafted soy candles and wheel-thrown ceramic bowls in Bilaspur artisan studio',
    primaryCta: {
      label: 'Shop Soy Candles',
      href: '/candles',
    },
    secondaryCta: {
      label: 'Explore Ceramics',
      href: '/ceramics',
    },
  },
  {
    id: 'slide-lotus',
    badge: 'Signature Ceramic Series · Heirloom Glaze',
    headlinePre: 'Sacred glow,',
    headlineScript: 'wheel-thrown',
    headlinePost: 'sculptural form.',
    subtext: 'Antique lotus bowls and delicate tealight centerpieces finished with handmade gold luster accents.',
    image: '/images/hero/banners/banner-lotus-collection.jpg',
    alt: 'Handmade black and gold lotus ceramic bowl glowing with candlelight',
    primaryCta: {
      label: 'Discover Lotus Bowls',
      href: '/ceramics',
    },
    secondaryCta: {
      label: 'View Tealight Holders',
      href: '/ceramics',
    },
  },
  {
    id: 'slide-gifting',
    badge: 'Local Bilaspur Delivery · Bespoke Hampers',
    headlinePre: 'Gifts that feel',
    headlineScript: 'warm, personal',
    headlinePost: '& lasting.',
    subtext: 'Artisan hampers packed with sculptural pillar candles, wax discs, and ceramic dishes for festive occasions.',
    image: '/images/hero/banners/banner-festive-gifting.jpg',
    alt: 'Artisan gift box hamper with handcrafted candles, wax melts, and ceramics',
    primaryCta: {
      label: 'Curated Gifting',
      href: '/candles',
    },
    secondaryCta: {
      label: 'Custom Orders',
      href: '/contact',
    },
  },
];

export const STORY_BUBBLES: StoryBubble[] = [
  {
    id: 'cat-candles',
    label: 'Soy Pillars',
    href: '/candles',
    image: '/images/hero/bubbles/bubble-candles.jpg',
    tag: 'Bestseller',
  },
  {
    id: 'cat-lotus',
    label: 'Lotus Bowls',
    href: '/ceramics',
    image: '/images/hero/bubbles/bubble-lotus.jpg',
    tag: 'Artisan',
  },
  {
    id: 'cat-trinket',
    label: 'Trinket Boxes',
    href: '/ceramics',
    image: '/images/hero/bubbles/bubble-trinket.jpg',
  },
  {
    id: 'cat-wax-discs',
    label: 'Wax Clusters',
    href: '/candles',
    image: '/images/hero/bubbles/bubble-wax-discs.jpg',
  },
  {
    id: 'cat-gifting',
    label: 'Gift Hampers',
    href: '/candles',
    image: '/images/hero/bubbles/bubble-gifting.jpg',
    tag: 'Festive',
  },
];

export const TRUST_BADGES: TrustBadge[] = [
  {
    id: 'trust-delivery',
    icon: 'truck',
    title: 'Bilaspur Express Delivery',
    description: 'Same-day & 24h doorstep delivery within Bilaspur; regional tracking across CG.',
  },
  {
    id: 'trust-wax',
    icon: 'leaf',
    title: '100% Pure Soy Wax',
    description: 'Non-toxic botanical wax with pure cotton wicks for a clean, soot-free burn.',
  },
  {
    id: 'trust-craft',
    icon: 'sparkles',
    title: 'Studio Handcrafted',
    description: 'Every piece wheel-thrown or hand-poured in micro-batches. No mass manufacturing.',
  },
  {
    id: 'trust-packaging',
    icon: 'shield',
    title: 'Breakage-Safe Guarantee',
    description: 'Triple-cushioned eco packaging ensuring ceramic treasures arrive flawless.',
  },
];
