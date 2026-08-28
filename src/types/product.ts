export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'candle' | 'ceramic';
  subCategory: string;
  price: number;
  salePrice?: number;
  images: string[];
  scentFamily?: 'floral' | 'woody' | 'fresh' | 'spice';
  materials: string[];
  dimensions?: string;
  story: string;
  scentNotes?: string[];
  badge?: 'bestseller' | 'new' | 'limited';
  colorFamily: 'clay' | 'mauve' | 'blush' | 'ivory' | 'forest' | 'gold';
  inStock: boolean;
}
