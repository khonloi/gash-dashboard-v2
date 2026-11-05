import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { InventoryClientView } from './InventoryClientView';
import { BackendProduct } from '@/types/product';

const mockProducts: BackendProduct[] = [
  {
    _id: 'p1',
    name: 'Mach 6 Running Shoe',
    slug: 'mach-6',
    description: 'Road shoe',
    price: 140,
    costPrice: 60,
    quantity: 15,
    lowStockThreshold: 5,
    sku: 'M6-001',
    category: 'Footwear',
    status: 'active',
  },
  {
    _id: 'p2',
    name: 'Trail Vest Pro',
    slug: 'trail-vest-pro',
    description: 'Hydration vest',
    price: 90,
    costPrice: 40,
    quantity: 2, // low stock (2 <= 5)
    lowStockThreshold: 5,
    sku: 'TV-002',
    category: 'Equipment',
    status: 'active',
  },
];

vi.mock('@/hooks/useProducts', () => ({
  useAdminProductsQuery: () => ({
    data: {
      products: mockProducts,
      total: 2,
    },
    isLoading: false,
  }),
  useUpdateStockMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('InventoryClientView', () => {
  it('renders KPI stats and products in inventory table', () => {
    render(<InventoryClientView />);

    expect(screen.getByText('Inventory Operations')).toBeDefined();
    expect(screen.getByText('Total Stock On Hand')).toBeDefined();
    expect(screen.getByText('17')).toBeDefined(); // 15 + 2 = 17 units
    expect(screen.getAllByText(/Low Stock Alerts/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Mach 6 Running Shoe')).toBeDefined();
    expect(screen.getByText('Trail Vest Pro')).toBeDefined();
  });

  it('filters by low stock tab', () => {
    render(<InventoryClientView />);

    const lowStockTab = screen.getByRole('tab', { name: /low stock alerts/i });
    fireEvent.click(lowStockTab);

    expect(screen.queryByText('Mach 6 Running Shoe')).toBeNull();
    expect(screen.getByText('Trail Vest Pro')).toBeDefined();
  });
});
