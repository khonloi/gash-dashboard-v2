import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OverviewClientView } from './OverviewClientView';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@/hooks/useProducts', () => ({
  useAdminProductsQuery: () => ({
    data: {
      products: [
        {
          _id: 'p1',
          name: 'Track Spike X',
          price: 120,
          quantity: 2,
          lowStockThreshold: 5,
          status: 'active',
        },
      ],
      total: 1,
    },
    isLoading: false,
  }),
  useProductStatsQuery: () => ({
    data: [
      { category: 'Footwear', numProducts: 12, avgPrice: 135 },
      { category: 'Apparel', numProducts: 8, avgPrice: 65 },
    ],
  }),
  useUpdateStockMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useOrders', () => ({
  useAllOrdersQuery: () => ({
    data: {
      orders: [
        {
          _id: 'ord-100',
          orderNumber: 'GS-2026-100',
          shippingAddress: { fullName: 'Marcus Vance' },
          total: 240,
          status: 'confirmed',
          items: [],
        },
      ],
    },
    isLoading: false,
  }),
}));

describe('OverviewClientView', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        _id: 'u1',
        email: 'admin@gash.demo',
        firstName: 'Elena',
        lastName: 'Rostova',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      },
      isAuthenticated: true,
    });
  });

  it('renders welcome greeting and KPI metric cards', () => {
    render(<OverviewClientView />);

    expect(screen.getByText('Elena')).toBeDefined();
    expect(screen.getByText('Total Store Revenue (GMV)')).toBeDefined();
    expect(screen.getByText('Fulfillment Orders')).toBeDefined();
    expect(screen.getByText('Active Products')).toBeDefined();
    expect(screen.getByText('Recent Orders')).toBeDefined();
    expect(screen.getByText('#GS-2026-100')).toBeDefined();
    expect(screen.getByText('Critical Stock Alerts')).toBeDefined();
    expect(screen.getByText('Track Spike X')).toBeDefined();
  });
});
