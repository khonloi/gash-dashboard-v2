import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  compareAtPrice: z.coerce
    .number()
    .positive('Compare-at price must be positive')
    .optional()
    .or(z.literal(0)),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative').optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z.string().optional(),
  brand: z.string().min(1, 'Brand is required'),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  isFeatured: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;
