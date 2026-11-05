import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrdersClientView from './OrdersClientView';
import { orderApiService } from '@/services/orderService';
import { useAuthStore } from '@/store/useAuthStore';
import { Order } from '@/types/order';
import { UserProfile } from '@/types/user';

vi.mock('@/services/orderService', () => ({
  orderApiService: {
    getAllOrders: vi.fn(),
  },
}));

const mockAdminUser: UserProfile = {
  _id: 'admin-1',
  email: 'admin@gash.demo',
  firstName: 'Admin',
  lastName: 'Lead',
  role: 'admin',
  isActive: true,
  isEmailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockCustomerUser: UserProfile = {
  _id: 'cust-1',
  email: 'customer@gash.demo',
  firstName: 'John',
  lastName: 'Customer',
  role: 'customer',
  isActive: true,
  isEmailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockTokens = {
  accessToken: 'valid-access-token',
  refreshToken: 'valid-refresh-token',
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('OrdersClientView', () => {
  const mockOrder: Order = {
    _id: 'ord-101',
    orderNumber: 'ORD-2026-999',
    user: 'user-1',
    items: [
      {
        product: 'prod-1',
        name: 'Nike Air Zoom Pegasus',
        sku: 'NK-AZP-42',
        price: 130,
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      phone: '0123456789',
      addressLine1: '456 Elm St',
      city: 'Ho Chi Minh',
      country: 'Vietnam',
    },
    shippingMethod: 'standard',
    shippingFee: 30,
    subtotal: 130,
    total: 160,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'delivered',
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-15T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('restricts access when user is not an administrator', async () => {
    useAuthStore.getState().setAuth(mockCustomerUser, mockTokens);

    renderWithClient(<OrdersClientView />);

    await waitFor(() => {
      expect(screen.getByText('Access Restricted')).toBeDefined();
    });
  });

  it('renders loading KPI and header for admin user', () => {
    useAuthStore.getState().setAuth(mockAdminUser, mockTokens);
    vi.mocked(orderApiService.getAllOrders).mockReturnValue(new Promise(() => {}));

    renderWithClient(<OrdersClientView />);

    expect(screen.getByRole('heading', { name: 'Orders & Fulfillment', level: 1 })).toBeDefined();
    expect(screen.getByText('Total Store Orders')).toBeDefined();
  });

  it('renders empty state when store has no orders', async () => {
    useAuthStore.getState().setAuth(mockAdminUser, mockTokens);
    vi.mocked(orderApiService.getAllOrders).mockResolvedValueOnce({
      orders: [],
      pagination: { page: 1, limit: 10, totalPages: 0, totalResults: 0 },
      results: 0,
    });

    renderWithClient(<OrdersClientView />);

    await waitFor(() => {
      expect(screen.getByText('No Orders Found')).toBeDefined();
    });
    expect(screen.getByText('No orders match your active filter criteria.')).toBeDefined();
  });

  it('renders list of orders in data table when orders are loaded', async () => {
    useAuthStore.getState().setAuth(mockAdminUser, mockTokens);
    vi.mocked(orderApiService.getAllOrders).mockResolvedValueOnce({
      orders: [mockOrder],
      pagination: { page: 1, limit: 10, totalPages: 1, totalResults: 1 },
      results: 1,
    });

    renderWithClient(<OrdersClientView />);

    await waitFor(() => {
      expect(screen.getByText('Order #ORD-2026-999')).toBeDefined();
    });

    expect(screen.getByText('delivered')).toBeDefined();
    expect(screen.getAllByText('$160.00').length).toBeGreaterThanOrEqual(1);
    expect(
      screen
        .getByRole('link', { name: /View Details for order ORD-2026-999/i })
        .getAttribute('href')
    ).toBe('/orders/ord-101');
  });
});
