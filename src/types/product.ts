export type ProductStatus = 'draft' | 'active' | 'archived';

export interface BackendProductImage {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface BackendProductVariant {
  name?: string;
  options?: string[];
  sku?: string;
  priceModifier?: number;
  stock?: number;
  // Legacy Shopify-compatible variant fields
  option1?: string;
  option2?: string;
  option3?: string;
  imageUrl?: string | null;
  featuredImage?: { src?: string };
}

export interface BackendProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface BackendProduct {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  quantity?: number;
  lowStockThreshold?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  images?: (BackendProductImage | string)[];
  variants?: BackendProductVariant[];
  attributes?: Record<string, string>;
  status?: ProductStatus;
  isFeatured?: boolean;
  weight?: number;
  dimensions?: BackendProductDimensions;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  createdAt?: string;
  updatedAt?: string;
  isLowStock?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;

  // Legacy fallback fields for backward compatibility
  title?: string;
  handle?: string;
  vendor?: string;
  productType?: string;
  bodyHtml?: string;
}

export interface ProductCategoryStats {
  category: string;
  numProducts: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalQuantity: number;
  avgRating: number;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  images?: (BackendProductImage | string)[];
  variants?: BackendProductVariant[];
  status?: ProductStatus;
  isFeatured?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface StockAdjustmentInput {
  quantity: number;
  operation: 'set' | 'increment' | 'decrement';
}

// Unified model consumed across the UI components (ProductCard, PDP, collections, etc.)
export interface FrontendProduct {
  id: string;
  brand: string;
  title: string;
  price: number;
  salePrice: number;
  originalPrice: number;
  discountPercent: number | null;
  imageUrl: string;
  category: string;
  gender: string;
  size: string;
  sizes: string[];
  color: string;
  colors: string[];
  sku: string;
  handle: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  isNew?: boolean;
}
