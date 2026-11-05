import {
  FrontendProduct,
  BackendProduct,
  BackendProductImage,
  BackendProductVariant,
} from '@/types/product';
import { SITE_CONFIG } from '@/constants/site';

export interface ProductPricing {
  salePrice: number;
  originalPrice: number;
  discountPercent: number | null;
}

export interface VariantOptions {
  sizes: string[];
  colors: string[];
}

export function extractProductImages(
  raw: BackendProduct | (Partial<BackendProduct> & { _id?: string; id?: string })
): { images: string[]; defaultImage: string } {
  let images: string[] = [];

  if (Array.isArray(raw.images) && raw.images.length > 0) {
    images = raw.images
      .map((img) => (typeof img === 'string' ? img : img.url))
      .filter((url): url is string => Boolean(url));
  } else if (Array.isArray(raw.variants)) {
    images = raw.variants
      .map((variant) => variant.featuredImage?.src || variant.imageUrl || '')
      .filter((url): url is string => Boolean(url));
  }

  let primaryImg = '';
  if (Array.isArray(raw.images)) {
    const primaryObj = raw.images.find(
      (img): img is BackendProductImage =>
        typeof img === 'object' && img !== null && Boolean(img.isPrimary)
    );
    if (primaryObj?.url) {
      primaryImg = primaryObj.url;
    }
  }

  const defaultImage = primaryImg || (images.length > 0 ? images[0] : '');
  return { images, defaultImage };
}

export function calculateProductPricing(
  raw: BackendProduct | (Partial<BackendProduct> & { _id?: string; id?: string })
): ProductPricing {
  const salePrice = typeof raw.price === 'number' ? raw.price : Number(raw.price || 0);
  const compareAtPrice =
    typeof raw.compareAtPrice === 'number' ? raw.compareAtPrice : Number(raw.compareAtPrice || 0);
  const originalPrice = compareAtPrice > salePrice ? compareAtPrice : salePrice;

  let discountPercent: number | null = null;
  if (typeof raw.discountPercentage === 'number' && raw.discountPercentage > 0) {
    discountPercent = raw.discountPercentage;
  } else if (originalPrice > salePrice) {
    discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }

  return { salePrice, originalPrice, discountPercent };
}

export function extractVariantOptions(variants?: BackendProductVariant[]): VariantOptions {
  const sizesSet = new Set<string>();
  const colorsSet = new Set<string>();

  if (Array.isArray(variants)) {
    variants.forEach((v) => {
      if (!v) return;

      // Structured format: variant.name = "Size" | "Color" and variant.options = ["S", "M", ...]
      if (typeof v.name === 'string' && Array.isArray(v.options)) {
        const lowerName = v.name.toLowerCase();
        if (lowerName.includes('size') || lowerName.includes('kích')) {
          v.options.forEach((opt) => typeof opt === 'string' && sizesSet.add(opt));
        } else if (lowerName.includes('color') || lowerName.includes('màu')) {
          v.options.forEach((opt) => typeof opt === 'string' && colorsSet.add(opt));
        } else {
          v.options.forEach((opt) => typeof opt === 'string' && sizesSet.add(opt));
        }
      }

      // Legacy Shopify-compatible format: option1, option2, option3
      if (typeof v.option1 === 'string') colorsSet.add(v.option1);
      if (typeof v.option2 === 'string') sizesSet.add(v.option2);
      if (typeof v.option3 === 'string') sizesSet.add(v.option3);
    });
  }

  return {
    sizes: Array.from(sizesSet),
    colors: Array.from(colorsSet),
  };
}

export function determineProductGender(tags?: (string | unknown)[]): string {
  const safeTags: string[] = Array.isArray(tags)
    ? tags.filter((t): t is string => typeof t === 'string')
    : [];
  const lowerTags = safeTags.map((t) => t.toLowerCase());

  if (
    lowerTags.some((t) => t === 'nữ' || t === 'women' || t === "women's" || t.includes('women'))
  ) {
    return 'Women';
  }
  if (
    lowerTags.some(
      (t) =>
        t === 'nam' || t === 'men' || t === "men's" || (t.includes('men') && !t.includes('women'))
    )
  ) {
    return 'Men';
  }
  if (lowerTags.some((t) => t.includes('trẻ em') || t.includes('kids') || t.includes('kid'))) {
    return 'Kids';
  }

  return 'Unisex';
}

export function extractProductSpecs(
  raw: BackendProduct | (Partial<BackendProduct> & { _id?: string; id?: string }),
  brand: string,
  category: string,
  gender: string,
  colors: string[],
  sizes: string[],
  desc: string
): Record<string, string> {
  const sku = raw.sku || '';
  const id = raw._id || raw.id || '';

  const structuredSpecs: Record<string, string> = {
    Brand: brand,
    'Product Type': category,
    Category: category,
    Gender: gender,
    'SKU / Style Code': sku || id,
  };

  if (colors.length > 0) {
    structuredSpecs['Colorway'] = colors.join(', ');
  }
  if (sizes.length > 0) {
    structuredSpecs['Available Sizes'] = sizes.join(', ');
  }
  if (typeof raw.ratingsAverage === 'number') {
    structuredSpecs['Rating'] = `${raw.ratingsAverage} / 5.0`;
  }

  if (raw.attributes && typeof raw.attributes === 'object') {
    Object.entries(raw.attributes).forEach(([key, val]) => {
      if (typeof val === 'string') {
        structuredSpecs[key] = val;
      }
    });
  }

  if (desc.includes('<li>')) {
    const liMatches = Array.from(desc.matchAll(/<li>(.*?)<\/li>/gi));
    liMatches.forEach((match: RegExpMatchArray, idx: number) => {
      const text = match[1].replace(/<[^>]*>/g, '').trim();
      if (text.includes(':')) {
        const [k, ...rest] = text.split(':');
        const keyTrimmed = k.trim();
        const valTrimmed = rest.join(':').trim();
        if (keyTrimmed && valTrimmed && !structuredSpecs[keyTrimmed]) {
          structuredSpecs[keyTrimmed] = valTrimmed;
        }
      } else if (text.length > 0 && idx < 5) {
        structuredSpecs[`Feature ${idx + 1}`] = text;
      }
    });
  }

  structuredSpecs['Authenticity'] = '100% Genuine & Authentic Partner';
  structuredSpecs['Exchange Policy'] = '30-Day Hassle-Free Exchange Policy';

  return structuredSpecs;
}

/**
 * Maps the backend Product model to the FrontendProduct model consumed across UI
 */
export function mapProductToFrontend(
  raw: BackendProduct | (Partial<BackendProduct> & { _id?: string; id?: string })
): FrontendProduct {
  if (!raw) {
    throw new Error('Cannot map empty product data');
  }

  const id = raw._id || raw.id || '';
  const title = raw.name || raw.title || '';
  const handle = raw.slug || raw.handle || id;
  const brand = raw.brand || raw.vendor || SITE_CONFIG.brandName;
  const category = raw.category || raw.productType || 'Sportswear';

  const { images, defaultImage } = extractProductImages(raw);
  const { salePrice, originalPrice, discountPercent } = calculateProductPricing(raw);
  const { sizes, colors } = extractVariantOptions(raw.variants);
  const gender = determineProductGender(raw.tags);
  const sku = raw.sku || '';
  const desc = raw.description || raw.bodyHtml || '';
  const specs = extractProductSpecs(raw, brand, category, gender, colors, sizes, desc);

  const rawCreatedAt = raw.createdAt ?? null;
  const isNew = Boolean(
    raw.isFeatured ||
    (rawCreatedAt && Date.now() - new Date(rawCreatedAt).getTime() < 30 * 24 * 60 * 60 * 1000)
  );

  return {
    id,
    handle,
    brand,
    title,
    price: salePrice,
    salePrice,
    originalPrice,
    discountPercent,
    imageUrl: defaultImage,
    category,
    gender,
    size: sizes.length > 0 ? sizes[0] : '',
    sizes,
    color: colors.length > 0 ? colors[0] : '',
    colors,
    sku,
    description: desc,
    specs,
    images: images.length > 0 ? images : [defaultImage].filter(Boolean),
    isNew,
  };
}
