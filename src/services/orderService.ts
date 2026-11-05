import { apiClient } from '@/lib/apiClient';
import { ApiResponse, PaginatedApiResponse } from '@/types/api';
import {
  Order,
  CreateOrderPayload,
  OrderQueryParams,
  OrderStatus,
  PaymentStatus,
} from '@/types/order';

export interface OrdersResult {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
  results: number;
}

export const orderApiService = {
  /**
   * Place a new order
   */
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<{ order: Order }>>('/orders', payload);
    return res.data.order;
  },

  /**
   * Get the current user's order history
   */
  getMyOrders: async (params?: OrderQueryParams): Promise<OrdersResult> => {
    const res = await apiClient.get<PaginatedApiResponse<{ orders: Order[] }>>('/orders/my', {
      params: params as Record<string, string | number | boolean>,
    });
    return {
      orders: res.data.orders,
      pagination: res.pagination,
      results: res.results,
    };
  },

  /**
   * Get an order by ID or orderNumber
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<{ order: Order }>>(`/orders/${orderId}`);
    return res.data.order;
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<{ order: Order }>>(`/orders/${orderId}/cancel`, {
      reason,
    });
    return res.data.order;
  },

  /**
   * Admin: Get all orders across the store
   */
  getAllOrders: async (params?: OrderQueryParams): Promise<OrdersResult> => {
    const res = await apiClient.get<PaginatedApiResponse<{ orders: Order[] }>>('/orders', {
      params: params as Record<string, string | number | boolean>,
    });
    return {
      orders: res.data.orders,
      pagination: res.pagination,
      results: res.results,
    };
  },

  /**
   * Admin: Update order status
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<{ order: Order }>>(`/orders/${orderId}/status`, {
      status,
    });
    return res.data.order;
  },

  /**
   * Admin: Update payment status
   */
  updatePaymentStatus: async (orderId: string, paymentStatus: PaymentStatus): Promise<Order> => {
    const res = await apiClient.patch<ApiResponse<{ order: Order }>>(`/orders/${orderId}/payment`, {
      paymentStatus,
    });
    return res.data.order;
  },
};
