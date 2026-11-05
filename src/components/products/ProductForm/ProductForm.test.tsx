import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ProductForm } from './ProductForm';

describe('ProductForm Component', () => {
  it('renders form and displays validation errors when submitting empty', async () => {
    const handleSubmit = vi.fn();
    render(<ProductForm onSubmit={handleSubmit} mode="create" />);

    const submitBtn = screen.getByRole('button', { name: 'Create Product' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Product name must be at least 2 characters')).toBeDefined();
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits valid data successfully', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ProductForm
        onSubmit={handleSubmit}
        initialData={{
          _id: 'p1',
          name: 'Speedster Pro',
          slug: 'speedster-pro',
          description: 'Top-tier racing flats designed for road marathons',
          price: 199.99,
          sku: 'SP-001',
          quantity: 25,
          category: 'Footwear',
          brand: 'GASH Performance',
          status: 'active',
        }}
        mode="edit"
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
