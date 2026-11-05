import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProductsClientView } from './ProductsClientView';
import { useAuthStore } from '@/store/useAuthStore';
import { BackendProduct } from '@/types/product';

const mockProducts: BackendProduct[] = [
  {
    _id: 'p1',
    name: 'AeroGlide 4',
    slug: 'aeroglide-4',
    description: 'Road runner',
    price: 160,
    compareAtPrice: 180,
    quantity: 12,
    sku: 'AG-004',
    category: 'Footwear',
    brand: 'GASH',
    status: 'active',
  },
];

vi.mock('@/hooks/useProducts', () => ({
  useAdminProductsQuery: () => ({
    data: {
      products: mockProducts,
      total: 1,
      page: 1,
      limit: 10,
    },
    isLoading: false,
  }),
  useDeleteProductMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateStockMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('ProductsClientView', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        _id: 'u1',
        email: 'admin@gash.demo',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      },
      isAuthenticated: true,
    });
  });

  it('renders products table and action buttons for admin', () => {
    render(<ProductsClientView />);

    expect(screen.getByText('Products Catalog')).toBeDefined();
    expect(screen.getByText('AeroGlide 4')).toBeDefined();
    expect(screen.getByText('SKU: AG-004')).toBeDefined();
    expect(screen.getByText('$160.00')).toBeDefined();

    // Verify Delete button exists for admin
    expect(screen.getByLabelText('Delete AeroGlide 4')).toBeDefined();
  });

  it('opens StockAdjustmentDrawer when adjust stock icon is clicked', () => {
    render(<ProductsClientView />);

    const adjustBtn = screen.getByLabelText('Adjust stock for AeroGlide 4');
    fireEvent.click(adjustBtn);

    expect(screen.getByText('Adjust Inventory Stock')).toBeDefined();
  });
});
