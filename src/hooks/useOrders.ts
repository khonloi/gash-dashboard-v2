import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApiService, OrdersResult } from '@/services/orderService';
import {
  Order,
  CreateOrderPayload,
  OrderQueryParams,
  OrderStatus,
  PaymentStatus,
} from '@/types/order';
import { STALE_TIME } from '@/lib/queryDefaults';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: OrderQueryParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

/**
 * Hook to fetch current user's orders with TanStack Query
 */
export function useMyOrdersQuery(
  params?: OrderQueryParams,
  options?: { enabled?: boolean; initialData?: OrdersResult }
) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApiService.getMyOrders(params),
    staleTime: STALE_TIME.STANDARD,
    ...options,
  });
}

/**
 * Hook to fetch a single order by ID or orderNumber
 */
export function useOrderQuery(
  orderId: string,
  options?: { enabled?: boolean; initialData?: Order }
) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderApiService.getOrderById(orderId),
    enabled: Boolean(orderId) && (options?.enabled ?? true),
    staleTime: STALE_TIME.STANDARD,
    ...options,
  });
}

/**
 * Mutation to place a new order
 */
export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderApiService.createOrder(payload),
    onSuccess: async (createdOrder) => {
      // Invalidate all order queries so history is refreshed
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.setQueryData(orderKeys.detail(createdOrder._id), createdOrder);
      if (createdOrder.orderNumber) {
        queryClient.setQueryData(orderKeys.detail(createdOrder.orderNumber), createdOrder);
      }
    },
  });
}

/**
 * Mutation to cancel an existing order
 */
export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      orderApiService.cancelOrder(orderId, reason),
    onSuccess: (updatedOrder, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
      if (updatedOrder._id !== orderId) {
        queryClient.setQueryData(orderKeys.detail(updatedOrder._id), updatedOrder);
      }
    },
  });
}

/**
 * Hook to fetch all store orders (Admin)
 */
export function useAllOrdersQuery(
  params?: OrderQueryParams,
  options?: { enabled?: boolean; initialData?: OrdersResult }
) {
  return useQuery({
    queryKey: ['orders', 'adminList', params],
    queryFn: () => orderApiService.getAllOrders(params),
    staleTime: STALE_TIME.STANDARD,
    ...options,
  });
}

/**
 * Mutation to update an order's fulfillment status (Admin)
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderApiService.updateOrderStatus(orderId, status),
    onSuccess: (updatedOrder, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
    },
  });
}

/**
 * Mutation to update an order's payment status (Admin)
 */
export function useUpdatePaymentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, paymentStatus }: { orderId: string; paymentStatus: PaymentStatus }) =>
      orderApiService.updatePaymentStatus(orderId, paymentStatus),
    onSuccess: (updatedOrder, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
    },
  });
}
