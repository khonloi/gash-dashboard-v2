import { describe, it, expect } from 'vitest';
import { mapProductToFrontend } from './productService';

describe('mapProductToFrontend', () => {
  it('maps standard product correctly', () => {
    const raw = {
      _id: '123',
      name: 'Test Product',
      slug: 'test-product',
      price: 100,
      brand: 'Test Brand',
      category: 'Shoes',
      images: [{ url: 'https://example.com/img1.jpg', isPrimary: true }],
    };

    const result = mapProductToFrontend(raw);

    expect(result.id).toBe('123');
    expect(result.title).toBe('Test Product');
    expect(result.handle).toBe('test-product');
    expect(result.price).toBe(100);
    expect(result.brand).toBe('Test Brand');
    expect(result.category).toBe('Shoes');
    expect(result.imageUrl).toBe('https://example.com/img1.jpg');
    expect(result.images).toEqual(['https://example.com/img1.jpg']);
  });

  it('infers gender from tags', () => {
    const rawMen = { _id: '1', tags: ['nam', 'running'] };
    const rawWomen = { _id: '2', tags: ["women's", 'shoes'] };

    expect(mapProductToFrontend(rawMen).gender).toBe('Men');
    expect(mapProductToFrontend(rawWomen).gender).toBe('Women');
  });

  it('calculates discount correctly', () => {
    const raw = {
      _id: '1',
      price: 80,
      compareAtPrice: 100,
    };

    const result = mapProductToFrontend(raw);
    expect(result.originalPrice).toBe(100);
    expect(result.discountPercent).toBe(20);
  });

  it('extracts sizes and colors from structured variants', () => {
    const raw = {
      _id: '1',
      variants: [
        { name: 'Size', options: ['S', 'M'] },
        { name: 'Color', options: ['Red', 'Blue'] },
      ],
    };

    const result = mapProductToFrontend(raw);
    expect(result.sizes).toEqual(['S', 'M']);
    expect(result.colors).toEqual(['Red', 'Blue']);
  });

  it('extracts sizes and colors from legacy Shopify options', () => {
    const raw = {
      _id: '1',
      variants: [
        { option1: 'Black', option2: 'L' },
        { option1: 'White', option2: 'XL' },
      ],
    };

    const result = mapProductToFrontend(raw);
    expect(result.colors).toContain('Black');
    expect(result.colors).toContain('White');
    expect(result.sizes).toContain('L');
    expect(result.sizes).toContain('XL');
  });

  it('extracts specs from HTML description', () => {
    const raw = {
      _id: '1',
      description: '<ul><li>Material: Cotton</li><li>Weight: 200g</li></ul>',
    };

    const result = mapProductToFrontend(raw);
    expect(result.specs['Material']).toBe('Cotton');
    expect(result.specs['Weight']).toBe('200g');
  });

  it('maps custom attributes and rating correctly', () => {
    const raw = {
      _id: '1',
      ratingsAverage: 4.8,
      attributes: {
        Closure: 'Lace-Up',
        Origin: 'Vietnam',
      },
    };

    const result = mapProductToFrontend(raw);
    expect(result.specs['Rating']).toBe('4.8 / 5.0');
    expect(result.specs['Closure']).toBe('Lace-Up');
    expect(result.specs['Origin']).toBe('Vietnam');
  });

  it('throws error when null or empty product data is passed', () => {
    // @ts-expect-error Testing runtime guard against null
    expect(() => mapProductToFrontend(null)).toThrow('Cannot map empty product data');
  });
});
