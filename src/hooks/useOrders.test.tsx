import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useMyOrdersQuery,
  useOrderQuery,
  usePlaceOrderMutation,
  useCancelOrderMutation,
} from './useOrders';
import { orderApiService } from '@/services/orderService';
import { Order, CreateOrderPayload } from '@/types/order';

vi.mock('@/services/orderService', () => ({
  orderApiService: {
    getMyOrders: vi.fn(),
    getOrderById: vi.fn(),
    createOrder: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
}

describe('useOrders hooks', () => {
  const mockOrder: Order = {
    _id: 'ord-123',
    orderNumber: 'ORD-2026-001',
    user: 'user-77',
    items: [],
    shippingAddress: {
      fullName: 'Jane Doe',
      phone: '1234567890',
      addressLine1: '123 Main St',
      city: 'Hanoi',
      country: 'Vietnam',
    },
    shippingMethod: 'standard',
    shippingFee: 30,
    subtotal: 100,
    total: 130,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'pending',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMyOrdersQuery', () => {
    it('fetches user orders successfully', async () => {
      const mockResult = {
        orders: [mockOrder],
        pagination: { page: 1, limit: 10, totalPages: 1, totalResults: 1 },
        results: 1,
      };
      vi.mocked(orderApiService.getMyOrders).mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useMyOrdersQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResult);
      expect(orderApiService.getMyOrders).toHaveBeenCalledWith(undefined);
    });
  });

  describe('useOrderQuery', () => {
    it('fetches order by id', async () => {
      vi.mocked(orderApiService.getOrderById).mockResolvedValueOnce(mockOrder);

      const { result } = renderHook(() => useOrderQuery('ord-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOrder);
      expect(orderApiService.getOrderById).toHaveBeenCalledWith('ord-123');
    });

    it('does not fetch when orderId is empty', () => {
      const { result } = renderHook(() => useOrderQuery(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(orderApiService.getOrderById).not.toHaveBeenCalled();
    });
  });

  describe('usePlaceOrderMutation', () => {
    it('places an order successfully', async () => {
      vi.mocked(orderApiService.createOrder).mockResolvedValueOnce(mockOrder);

      const { result } = renderHook(() => usePlaceOrderMutation(), {
        wrapper: createWrapper(),
      });

      const payload: CreateOrderPayload = {
        shippingAddress: mockOrder.shippingAddress,
      };

      result.current.mutate(payload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orderApiService.createOrder).toHaveBeenCalledWith(payload);
    });
  });

  describe('useCancelOrderMutation', () => {
    it('cancels an order', async () => {
      const cancelledOrder: Order = { ...mockOrder, status: 'cancelled' };
      vi.mocked(orderApiService.cancelOrder).mockResolvedValueOnce(cancelledOrder);

      const { result } = renderHook(() => useCancelOrderMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ orderId: 'ord-123', reason: 'Changed mind' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orderApiService.cancelOrder).toHaveBeenCalledWith('ord-123', 'Changed mind');
      expect(result.current.data).toEqual(cancelledOrder);
    });
  });
});
