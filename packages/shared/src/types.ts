export interface CustomOptions {
  fragrances?: string[];
  waxTones?: string[];
  sizes?: string[];
  finishes?: string[];
  allowGiftMessage?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'candle' | 'ceramic';
  subCategory: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  scentFamily?: 'floral' | 'woody' | 'fresh' | 'spice' | null;
  materials: string[];
  dimensions?: string | null;
  story: string;
  scentNotes?: string[] | null;
  badge?: 'bestseller' | 'new' | 'limited' | null;
  colorFamily: 'clay' | 'mauve' | 'blush' | 'ivory' | 'forest' | 'gold';
  inStock: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  customOptions?: CustomOptions | null;
}
