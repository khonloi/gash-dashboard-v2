import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderDetailClientView from './OrderDetailClientView';
import { orderApiService } from '@/services/orderService';
import { useToastStore } from '@/store/useToastStore';
import { Order } from '@/types/order';

vi.mock('@/services/orderService', () => ({
  orderApiService: {
    getOrderById: vi.fn(),
    cancelOrder: vi.fn(),
  },
}));

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

describe('OrderDetailClientView', () => {
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
        quantity: 2,
        size: '10',
        color: 'Volt Black',
        imageUrl: 'https://example.com/shoe.jpg',
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
    subtotal: 260,
    total: 290,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'pending',
    contactEmail: 'john@example.com',
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-15T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when fetching order', () => {
    vi.mocked(orderApiService.getOrderById).mockReturnValue(new Promise(() => {}));

    renderWithClient(<OrderDetailClientView orderId="ord-101" />);

    expect(document.querySelector('.headerSkeleton')).toBeDefined();
  });

  it('renders not found state when order does not exist or fetch fails', async () => {
    vi.mocked(orderApiService.getOrderById).mockRejectedValueOnce(new Error('Not found'));

    renderWithClient(<OrderDetailClientView orderId="ord-999" />);

    await waitFor(() => {
      expect(screen.getByText('Order Not Found')).toBeDefined();
    });

    expect(screen.getByText("We couldn't find the order you're looking for.")).toBeDefined();
    expect(screen.getByRole('link', { name: 'Back to Orders' }).getAttribute('href')).toBe(
      '/orders'
    );
  });

  it('renders full order details and can cancel a pending order', async () => {
    vi.mocked(orderApiService.getOrderById).mockResolvedValueOnce(mockOrder);
    const cancelMock = vi.mocked(orderApiService.cancelOrder).mockResolvedValueOnce({
      ...mockOrder,
      status: 'cancelled',
    });

    // Mock confirm dialog
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const addToastSpy = vi.spyOn(useToastStore.getState(), 'addToast');

    renderWithClient(<OrderDetailClientView orderId="ord-101" />);

    await waitFor(() => {
      expect(screen.getByText('Order #ORD-2026-999')).toBeDefined();
    });

    expect(screen.getByText('Nike Air Zoom Pegasus')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('$290.00')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Cancel Order' })).toBeDefined();

    // Click Cancel Order
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Order' }));

    await waitFor(() => {
      expect(cancelMock).toHaveBeenCalledWith('ord-101', 'User requested cancellation');
    });

    expect(addToastSpy).toHaveBeenCalledWith('Order cancelled successfully', 'success');

    confirmSpy.mockRestore();
  });
});
