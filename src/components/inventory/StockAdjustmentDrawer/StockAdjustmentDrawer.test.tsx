import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StockAdjustmentDrawer } from './StockAdjustmentDrawer';
import { BackendProduct } from '@/types/product';

const mockMutateAsync = vi.fn().mockResolvedValue({});
vi.mock('@/hooks/useProducts', () => ({
  useUpdateStockMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

const mockProduct: BackendProduct = {
  _id: 'prod_1',
  name: 'Ultra Boost 24',
  slug: 'ultra-boost-24',
  description: 'Running shoe',
  price: 180,
  quantity: 20,
  sku: 'UB24-001',
  category: 'Footwear',
  status: 'active',
};

describe('StockAdjustmentDrawer Component', () => {
  it('renders product details and calculates resulting stock', () => {
    render(<StockAdjustmentDrawer isOpen={true} onClose={vi.fn()} product={mockProduct} />);

    expect(screen.getByText('Ultra Boost 24')).toBeDefined();
    expect(screen.getByText('SKU: UB24-001')).toBeDefined();
    expect(screen.getByText('20')).toBeDefined(); // Current stock
    expect(screen.getByText('30')).toBeDefined(); // Default 20 + 10 = 30
  });

  it('triggers updateStockMutation on form submission', async () => {
    const handleClose = vi.fn();
    render(<StockAdjustmentDrawer isOpen={true} onClose={handleClose} product={mockProduct} />);

    const applyBtn = screen.getByRole('button', { name: 'Apply Adjustment' });
    fireEvent.click(applyBtn);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'prod_1',
      payload: {
        quantity: 10,
        operation: 'increment',
      },
    });
  });
});
