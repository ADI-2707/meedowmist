import productsData from '@/data/products.json';
import type { Product } from '@/types/product';

// Today: import from local JSON.
// Future: swap to → await fetch('/api/products') or CMS client call.
// Every component consuming these functions stays untouched.

const products = productsData as Product[];

export async function getProducts(category?: 'candle' | 'ceramic'): Promise<Product[]> {
  if (!category) return products;
  return products.filter((p) => p.category === category);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(
  currentSlug: string,
  category: 'candle' | 'ceramic',
  limit = 3
): Promise<Product[]> {
  return products
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit);
}

export function getAllSlugs(): string[] {
  return products.map((p) => p.slug);
}

export function getFeaturedProducts(limit = 3, category?: 'candle' | 'ceramic'): Product[] {
  const filtered = category ? products.filter((p) => p.category === category) : products;
  // Prefer bestsellers and new badges first
  const sorted = [...filtered].sort((a, b) => {
    const rank = { bestseller: 2, new: 1, limited: 1 } as Record<string, number>;
    return (rank[b.badge ?? ''] ?? 0) - (rank[a.badge ?? ''] ?? 0);
  });
  return sorted.slice(0, limit);
}
