import { describe, it, expect } from 'vitest';
import { productSchema } from './productValidation';

describe('productSchema', () => {
  it('validates a valid product payload', () => {
    const validData = {
      name: 'Trail Blazer 3',
      description: 'High-performance mountain running shoe',
      price: 159.99,
      sku: 'TB3-001',
      quantity: 50,
      category: 'Footwear',
      brand: 'GASH Performance',
      status: 'active' as const,
    };

    const result = productSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails validation when required fields are missing or invalid', () => {
    const invalidData = {
      name: 'A', // too short
      description: 'Short', // too short
      price: -10, // negative price
      quantity: -5, // negative quantity
      category: '',
      brand: '',
      sku: '',
    };

    const result = productSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      expect(errorMap.name).toBeDefined();
      expect(errorMap.price).toBeDefined();
      expect(errorMap.quantity).toBeDefined();
      expect(errorMap.sku).toBeDefined();
    }
  });
});
