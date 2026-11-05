import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderApiService } from './orderService';
import { apiClient } from '@/lib/apiClient';
import { Order, CreateOrderPayload } from '@/types/order';

describe('orderApiService', () => {
  const mockOrder: Order = {
    _id: 'ord-123',
    orderNumber: 'ORD-2026-0001',
    user: 'user-1',
    items: [
      {
        _id: 'item-1',
        product: 'prod-1',
        name: 'Nike Pegasus 41',
        sku: 'PEG-41-BLK',
        price: 130,
        quantity: 1,
        size: '10',
        color: 'Black',
      },
    ],
    shippingAddress: {
      fullName: 'Jane Doe',
      phone: '1234567890',
      addressLine1: '123 Main St',
      city: 'Portland',
      country: 'USA',
    },
    shippingMethod: 'standard',
    shippingFee: 15,
    subtotal: 130,
    total: 145,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    status: 'pending',
    createdAt: '2026-09-29T12:00:00.000Z',
    updatedAt: '2026-09-29T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createOrder', () => {
    it('sends POST to /orders and returns created order', async () => {
      const payload: CreateOrderPayload = {
        shippingAddress: mockOrder.shippingAddress,
        shippingMethod: 'standard',
        paymentMethod: 'credit_card',
        contactEmail: 'jane@example.com',
      };

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: { order: mockOrder },
      });

      const result = await orderApiService.createOrder(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/orders', payload);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getMyOrders', () => {
    it('sends GET to /orders/my with params and returns structured result', async () => {
      const pagination = {
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      };

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 'success',
        results: 1,
        pagination,
        data: { orders: [mockOrder] },
      });

      const result = await orderApiService.getMyOrders({ page: 1, limit: 10, status: 'pending' });

      expect(apiClient.get).toHaveBeenCalledWith('/orders/my', {
        params: { page: 1, limit: 10, status: 'pending' },
      });
      expect(result.orders).toEqual([mockOrder]);
      expect(result.pagination).toEqual(pagination);
      expect(result.results).toBe(1);
    });
  });

  describe('getOrderById', () => {
    it('sends GET to /orders/:id and returns order', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 'success',
        data: { order: mockOrder },
      });

      const result = await orderApiService.getOrderById('ord-123');

      expect(apiClient.get).toHaveBeenCalledWith('/orders/ord-123');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('sends PATCH to /orders/:id/cancel with reason and returns cancelled order', async () => {
      const cancelledOrder: Order = {
        ...mockOrder,
        status: 'cancelled',
        cancelReason: 'Customer requested cancellation',
      };

      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        status: 'success',
        data: { order: cancelledOrder },
      });

      const result = await orderApiService.cancelOrder(
        'ord-123',
        'Customer requested cancellation'
      );

      expect(apiClient.patch).toHaveBeenCalledWith('/orders/ord-123/cancel', {
        reason: 'Customer requested cancellation',
      });
      expect(result.status).toBe('cancelled');
      expect(result.cancelReason).toBe('Customer requested cancellation');
    });
  });

  describe('getAllOrders', () => {
    it('sends GET to /orders with params for admin', async () => {
      const pagination = {
        page: 2,
        limit: 20,
        totalPages: 5,
        totalResults: 100,
      };

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 'success',
        results: 20,
        pagination,
        data: { orders: [mockOrder] },
      });

      const result = await orderApiService.getAllOrders({ page: 2, limit: 20 });

      expect(apiClient.get).toHaveBeenCalledWith('/orders', {
        params: { page: 2, limit: 20 },
      });
      expect(result.orders).toHaveLength(1);
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('updateOrderStatus', () => {
    it('sends PATCH to /orders/:id/status with new status', async () => {
      const shippedOrder: Order = {
        ...mockOrder,
        status: 'shipped',
      };

      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        status: 'success',
        data: { order: shippedOrder },
      });

      const result = await orderApiService.updateOrderStatus('ord-123', 'shipped');

      expect(apiClient.patch).toHaveBeenCalledWith('/orders/ord-123/status', {
        status: 'shipped',
      });
      expect(result.status).toBe('shipped');
    });
  });
});
