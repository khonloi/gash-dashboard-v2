import { describe, it, expect, beforeEach } from 'vitest';
import { handleMockRequest, resetDemoState } from './mockApiHandler';
import { ApiError } from '@/lib/errors';
import { BackendProduct, ProductCategoryStats } from '@/types/product';
import { UserProfile, AuthResponseData } from '@/types/user';
import { Order } from '@/types/order';

describe('mockApiHandler', () => {
  beforeEach(() => {
    resetDemoState();
  });

  describe('Products', () => {
    it('returns all products with pagination on GET /products', async () => {
      const res = await handleMockRequest<{
        status: string;
        results: number;
        data: { products: BackendProduct[] };
      }>('GET', '/products');

      expect(res.status).toBe('success');
      expect(res.data.products.length).toBeGreaterThan(0);
      expect(res.results).toBe(res.data.products.length);
    });

    it('filters products by search keyword', async () => {
      const res = await handleMockRequest<{
        data: { products: BackendProduct[] };
      }>('GET', '/products', undefined, { q: 'Mach' });

      expect(res.data.products.length).toBeGreaterThan(0);
      expect(res.data.products[0].name).toContain('Mach');
    });

    it('filters products by category and brand', async () => {
      const res = await handleMockRequest<{
        data: { products: BackendProduct[] };
      }>('GET', '/products', undefined, { category: 'running', brand: 'hoka' });

      expect(res.data.products.length).toBeGreaterThan(0);
      expect(res.data.products.every((p) => p.brand?.toLowerCase() === 'hoka')).toBe(true);
    });

    it('returns featured products on GET /products/featured', async () => {
      const res = await handleMockRequest<{
        data: { products: BackendProduct[] };
      }>('GET', '/products/featured', undefined, { limit: 2 });

      expect(res.data.products.length).toBeLessThanOrEqual(2);
      expect(res.data.products[0].isFeatured).toBe(true);
    });

    it('returns category stats on GET /products/stats', async () => {
      const res = await handleMockRequest<{
        data: { stats: ProductCategoryStats[] };
      }>('GET', '/products/stats');

      expect(res.data.stats.length).toBeGreaterThan(0);
      expect(res.data.stats[0].category).toBeDefined();
    });

    it('fetches a product by slug on GET /products/slug/:slug', async () => {
      const res = await handleMockRequest<{
        data: { product: BackendProduct };
      }>('GET', '/products/slug/giay-chay-bo-nu-hoka-mach-7-1171938-fvyg-fvyg');

      expect(res.data.product.name).toContain('Mach 7');
      expect(res.data.product.price).toBe(152);
    });

    it('throws ApiError 404 for nonexistent slug', async () => {
      await expect(
        handleMockRequest('GET', '/products/slug/nonexistent-item-handle')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('Authentication', () => {
    it('authenticates user on POST /auth/login', async () => {
      const res = await handleMockRequest<{ data: AuthResponseData }>('POST', '/auth/login', {
        email: 'test@jocksport.demo',
        password: 'password123',
      });

      expect(res.data.user.email).toBe('test@jocksport.demo');
      expect(res.data.tokens.accessToken).toBeDefined();
    });

    it('registers a new user on POST /auth/register', async () => {
      const res = await handleMockRequest<{ data: AuthResponseData }>('POST', '/auth/register', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@demo.com',
        password: 'password123',
      });

      expect(res.data.user.firstName).toBe('John');
      expect(res.data.user.email).toBe('john.doe@demo.com');
      expect(res.data.tokens.accessToken).toBeDefined();
    });

    it('refreshes token on POST /auth/refresh-token', async () => {
      const res = await handleMockRequest<{
        data: { tokens: { accessToken: string } };
      }>('POST', '/auth/refresh-token', { refreshToken: 'mock' });

      expect(res.data.tokens.accessToken).toBeDefined();
    });
  });

  describe('User Profile & Addresses', () => {
    it('returns current user profile on GET /users/me', async () => {
      const res = await handleMockRequest<{
        data: { user: UserProfile };
      }>('GET', '/users/me');

      expect(res.data.user.email).toBeDefined();
    });

    it('updates user profile on PATCH /users/me', async () => {
      const res = await handleMockRequest<{
        data: { user: UserProfile };
      }>('PATCH', '/users/me', { firstName: 'UpdatedName' });

      expect(res.data.user.firstName).toBe('UpdatedName');
    });

    it('adds and deletes user delivery addresses', async () => {
      // Add address
      const addRes = await handleMockRequest<{
        data: { addresses: Array<{ _id: string; addressLine1: string }> };
      }>('POST', '/users/me/addresses', {
        fullName: 'Alex Test',
        addressLine1: '456 Stadium Blvd',
        city: 'Eugene',
        state: 'Oregon',
        postalCode: '97401',
        country: 'United States',
      });

      const newAddress = addRes.data.addresses.find((a) => a.addressLine1 === '456 Stadium Blvd');
      expect(newAddress).toBeDefined();

      // Delete address
      const delRes = await handleMockRequest<{
        data: { addresses: Array<{ _id: string }> };
      }>('DELETE', `/users/me/addresses/${newAddress?._id}`);

      expect(delRes.data.addresses.some((a) => a._id === newAddress?._id)).toBe(false);
    });
  });

  describe('Orders Operations', () => {
    it('creates and lists orders', async () => {
      const orderRes = await handleMockRequest<{
        data: { order: Order };
      }>('POST', '/orders', {
        shippingAddress: {
          fullName: 'Alex Morgan',
          phone: '+1 555-0199',
          addressLine1: '123 Track Lane',
          city: 'Portland',
          country: 'United States',
        },
        shippingMethod: 'express',
        paymentMethod: 'credit_card',
      });

      expect(orderRes.data.order.orderNumber).toBeDefined();
      expect(orderRes.data.order.status).toBe('confirmed');

      // Fetch order by ID
      const singleOrderRes = await handleMockRequest<{
        data: { order: Order };
      }>('GET', `/orders/${orderRes.data.order._id}`);

      expect(singleOrderRes.data.order._id).toBe(orderRes.data.order._id);

      // Cancel order
      const cancelRes = await handleMockRequest<{
        data: { order: Order };
      }>('PATCH', `/orders/${orderRes.data.order._id}/cancel`, {
        reason: 'Customer requested cancellation',
      });

      expect(cancelRes.data.order.status).toBe('cancelled');
    });

    it('updates order fulfillment and payment statuses', async () => {
      const allOrders = await handleMockRequest<{ data: { orders: Order[] } }>('GET', '/orders');
      const testOrderId = allOrders.data.orders[0]._id;

      const statusRes = await handleMockRequest<{ data: { order: Order } }>(
        'PATCH',
        `/orders/${testOrderId}/status`,
        { status: 'shipped' }
      );
      expect(statusRes.data.order.status).toBe('shipped');

      const paymentRes = await handleMockRequest<{ data: { order: Order } }>(
        'PATCH',
        `/orders/${testOrderId}/payment`,
        { paymentStatus: 'paid' }
      );
      expect(paymentRes.data.order.paymentStatus).toBe('paid');
    });
  });

  describe('Product Management & Stock Adjustments', () => {
    it('creates, updates, adjusts stock, and deletes a product', async () => {
      // 1. Create product
      const createRes = await handleMockRequest<{ data: { product: BackendProduct } }>(
        'POST',
        '/products',
        {
          name: 'Pro Nitro Superfly',
          price: 220,
          quantity: 25,
          category: 'Footwear',
          sku: 'PNS-001',
        }
      );
      expect(createRes.data.product._id).toBeDefined();
      expect(createRes.data.product.name).toBe('Pro Nitro Superfly');
      expect(createRes.data.product.quantity).toBe(25);

      const prodId = createRes.data.product._id;

      // 2. Update product
      const updateRes = await handleMockRequest<{ data: { product: BackendProduct } }>(
        'PATCH',
        `/products/${prodId}`,
        { price: 240 }
      );
      expect(updateRes.data.product.price).toBe(240);

      // 3. Increment stock
      const stockRes = await handleMockRequest<{ data: { product: BackendProduct } }>(
        'PATCH',
        `/products/${prodId}/stock`,
        { quantity: 10, operation: 'increment' }
      );
      expect(stockRes.data.product.quantity).toBe(35);

      // 4. Delete product
      const deleteRes = await handleMockRequest<{ status: string }>(
        'DELETE',
        `/products/${prodId}`
      );
      expect(deleteRes.status).toBe('success');

      // Verify not found
      await expect(handleMockRequest('GET', `/products/${prodId}`)).rejects.toThrow();
    });
  });

  describe('Admin User Directory', () => {
    it('lists, filters, updates role, and deletes users', async () => {
      const listRes = await handleMockRequest<{ data: { users: UserProfile[] } }>('GET', '/users');
      expect(listRes.data.users.length).toBeGreaterThan(0);

      const targetUser = listRes.data.users[0];

      // Update role
      const roleRes = await handleMockRequest<{ data: { user: UserProfile } }>(
        'PATCH',
        `/users/${targetUser._id}/role`,
        { role: 'seller' }
      );
      expect(roleRes.data.user.role).toBe('seller');

      // Delete user
      const deleteRes = await handleMockRequest<{ status: string }>(
        'DELETE',
        `/users/${targetUser._id}`
      );
      expect(deleteRes.status).toBe('success');
    });
  });
});
