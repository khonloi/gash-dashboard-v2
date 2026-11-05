import { describe, it, expect } from 'vitest';
import {
  mapProductToFrontend,
  extractProductImages,
  calculateProductPricing,
  extractVariantOptions,
  determineProductGender,
  extractProductSpecs,
} from './productMapper';
import { BackendProduct } from '@/types/product';

describe('productMapper', () => {
  const baseBackendProduct: BackendProduct = {
    _id: 'prod-99',
    name: 'Air Max 90',
    slug: 'air-max-90',
    description:
      '<p>Iconic sneaker</p><ul><li>Material: Leather</li><li>Technology: Air Max</li></ul>',
    price: 120,
    compareAtPrice: 150,
    category: 'Footwear',
    brand: 'Nike',
    tags: ['men', 'running', 'lifestyle'],
    images: [
      { url: 'https://example.com/img1.jpg', isPrimary: true },
      { url: 'https://example.com/img2.jpg' },
    ],
    variants: [
      { name: 'Size', options: ['8', '9', '10'] },
      { name: 'Color', options: ['Infrared', 'White'] },
    ],
    ratingsAverage: 4.8,
  };

  it('correctly maps full product to FrontendProduct', () => {
    const frontend = mapProductToFrontend(baseBackendProduct);

    expect(frontend.id).toBe('prod-99');
    expect(frontend.title).toBe('Air Max 90');
    expect(frontend.brand).toBe('Nike');
    expect(frontend.category).toBe('Footwear');
    expect(frontend.gender).toBe('Men');
    expect(frontend.salePrice).toBe(120);
    expect(frontend.originalPrice).toBe(150);
    expect(frontend.discountPercent).toBe(20);
    expect(frontend.imageUrl).toBe('https://example.com/img1.jpg');
    expect(frontend.sizes).toEqual(['8', '9', '10']);
    expect(frontend.colors).toEqual(['Infrared', 'White']);
    expect(frontend.specs['Material']).toBe('Leather');
    expect(frontend.specs['Technology']).toBe('Air Max');
    expect(frontend.specs['Rating']).toBe('4.8 / 5.0');
  });

  it('extracts primary and gallery images properly', () => {
    const { defaultImage, images } = extractProductImages({
      images: [
        { url: 'https://example.com/thumb.jpg' },
        { url: 'https://example.com/main.jpg', isPrimary: true },
      ],
    });
    expect(defaultImage).toBe('https://example.com/main.jpg');
    expect(images).toHaveLength(2);
  });

  it('extracts product specs from raw product and HTML description', () => {
    const specs = extractProductSpecs(
      { ratingsAverage: 4.5, sku: 'TEST-SKU' },
      'Nike',
      'Shoes',
      'Men',
      ['Black', 'White'],
      ['8', '9'],
      '<ul><li>Material: Synthetic</li><li>Fit: Slim</li></ul>'
    );
    expect(specs['Brand']).toBe('Nike');
    expect(specs['Gender']).toBe('Men');
    expect(specs['SKU / Style Code']).toBe('TEST-SKU');
    expect(specs['Colorway']).toBe('Black, White');
    expect(specs['Available Sizes']).toBe('8, 9');
    expect(specs['Rating']).toBe('4.5 / 5.0');
    expect(specs['Material']).toBe('Synthetic');
    expect(specs['Fit']).toBe('Slim');
  });

  it('determines gender based on tags', () => {
    expect(determineProductGender(['women', 'training'])).toBe('Women');
    expect(determineProductGender(['nữ', 'giày'])).toBe('Women');
    expect(determineProductGender(['men', 'gym'])).toBe('Men');
    expect(determineProductGender(['nam', 'chạy bộ'])).toBe('Men');
    expect(determineProductGender(['kids', 'running'])).toBe('Kids');
    expect(determineProductGender(['trẻ em', 'giày'])).toBe('Kids');
    expect(determineProductGender(['unisex', 'gear'])).toBe('Unisex');
  });

  it('handles legacy Shopify-compatible variant format', () => {
    const variants = [
      { option1: 'Red', option2: '9', option3: 'Wide' },
      { option1: 'Blue', option2: '10' },
    ];
    const { sizes, colors } = extractVariantOptions(variants);
    expect(sizes).toContain('9');
    expect(sizes).toContain('10');
    expect(colors).toContain('Red');
    expect(colors).toContain('Blue');
  });

  it('calculates pricing and discounts accurately', () => {
    const pricingWithCompare = calculateProductPricing({
      price: 75,
      compareAtPrice: 100,
    } as unknown as BackendProduct);
    expect(pricingWithCompare.salePrice).toBe(75);
    expect(pricingWithCompare.originalPrice).toBe(100);
    expect(pricingWithCompare.discountPercent).toBe(25);

    const pricingNoDiscount = calculateProductPricing({
      price: 100,
      compareAtPrice: 80,
    } as unknown as BackendProduct);
    expect(pricingNoDiscount.discountPercent).toBeNull();
  });

  it('throws error when mapping empty or null raw product', () => {
    expect(() => mapProductToFrontend(null as unknown as BackendProduct)).toThrow(
      'Cannot map empty product data'
    );
  });
});
