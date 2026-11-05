import {
  mockProducts,
  mockStats,
  mockUser,
  mockSellerUser,
  mockCustomerUser,
  mockUsersList,
  mockTokens,
  mockOrders,
} from './mockData';
import { UserProfile, UserAddress, UserRole } from '@/types/user';
import { Order, CreateOrderPayload, OrderStatus, PaymentStatus } from '@/types/order';
import { BackendProduct } from '@/types/product';
import { QueryParams } from '@/lib/apiClient';
import { ApiError } from '@/lib/errors';

// Stateful in-memory stores for interactive demo sessions
let currentUser: UserProfile = JSON.parse(JSON.stringify(mockUser));
let currentOrders: Order[] = JSON.parse(JSON.stringify(mockOrders));
let currentProducts: BackendProduct[] = JSON.parse(JSON.stringify(mockProducts));
let currentUsers: UserProfile[] = JSON.parse(JSON.stringify(mockUsersList));

/**
 * Reset demo state back to pristine initial fixture data
 */
export function resetDemoState(): void {
  currentUser = JSON.parse(JSON.stringify(mockUser));
  currentOrders = JSON.parse(JSON.stringify(mockOrders));
  currentProducts = JSON.parse(JSON.stringify(mockProducts));
  currentUsers = JSON.parse(JSON.stringify(mockUsersList));
}

/**
 * Switch demo user persona
 */
export function switchDemoPersona(role: 'admin' | 'seller' | 'customer'): UserProfile {
  if (role === 'seller') {
    currentUser = JSON.parse(JSON.stringify(mockSellerUser));
  } else if (role === 'customer') {
    currentUser = JSON.parse(JSON.stringify(mockCustomerUser));
  } else {
    currentUser = JSON.parse(JSON.stringify(mockUser));
  }
  return currentUser;
}

/**
 * Artificial network latency simulation (in ms)
 */
const DEMO_LATENCY_MS = 150;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Handle and route intercepted API requests for offline demo mode
 */
export async function handleMockRequest<T>(
  method: string,
  endpoint: string,
  bodyRaw?: unknown,
  params?: QueryParams
): Promise<T> {
  await delay(DEMO_LATENCY_MS);

  // Normalize endpoint path (strip query params and leading /api/v1 if present)
  let cleanPath = endpoint.split('?')[0].replace(/^\/api\/v1/, '');
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // Parse body safely if stringified JSON
  let body: Record<string, unknown> = {};
  if (typeof bodyRaw === 'string') {
    try {
      body = JSON.parse(bodyRaw);
    } catch {
      body = {};
    }
  } else if (typeof bodyRaw === 'object' && bodyRaw !== null) {
    body = bodyRaw as Record<string, unknown>;
  }

  // ==========================================
  // 1. PRODUCTS ENDPOINTS
  // ==========================================

  // GET /products/featured
  if (method === 'GET' && cleanPath === '/products/featured') {
    const limit = Number(params?.limit || 10);
    const featured = currentProducts.filter((p) => p.isFeatured).slice(0, limit);
    return {
      status: 'success',
      data: { products: featured.length > 0 ? featured : currentProducts.slice(0, limit) },
    } as T;
  }

  // GET /products/stats
  if (method === 'GET' && cleanPath === '/products/stats') {
    return {
      status: 'success',
      data: { stats: mockStats },
    } as T;
  }

  // GET /products/slug/:slug
  const slugMatch = cleanPath.match(/^\/products\/slug\/([^/]+)$/);
  if (method === 'GET' && slugMatch) {
    const slug = decodeURIComponent(slugMatch[1]).toLowerCase();
    const product = currentProducts.find(
      (p) =>
        p.slug?.toLowerCase() === slug ||
        p._id?.toLowerCase() === slug ||
        p.handle?.toLowerCase() === slug
    );

    if (!product) {
      throw new ApiError(`Product with slug "${slug}" not found in demo catalog`, 404);
    }

    return {
      status: 'success',
      data: { product },
    } as T;
  }

  // PATCH /products/:id/stock (Atomic stock adjustment)
  const stockMatch = cleanPath.match(/^\/products\/([^/]+)\/stock$/);
  if (method === 'PATCH' && stockMatch) {
    const id = decodeURIComponent(stockMatch[1]);
    const product = currentProducts.find((p) => p._id === id || p.id === id);

    if (!product) {
      throw new ApiError(`Product with ID "${id}" not found`, 404);
    }

    const qty = Number(body.quantity || 0);
    const op = String(body.operation || 'set');
    const currentQty = product.quantity ?? 0;

    if (op === 'increment') {
      product.quantity = currentQty + qty;
    } else if (op === 'decrement') {
      product.quantity = Math.max(0, currentQty - qty);
    } else {
      product.quantity = Math.max(0, qty);
    }

    product.isLowStock = (product.quantity ?? 0) <= (product.lowStockThreshold || 5);
    product.updatedAt = new Date().toISOString();

    return {
      status: 'success',
      data: { product },
    } as T;
  }

  // GET /products/:id (single product by ID)
  const productByIdMatch = cleanPath.match(/^\/products\/([^/]+)$/);
  if (
    method === 'GET' &&
    productByIdMatch &&
    productByIdMatch[1] !== 'featured' &&
    productByIdMatch[1] !== 'stats'
  ) {
    const id = decodeURIComponent(productByIdMatch[1]).toLowerCase();
    const product = currentProducts.find(
      (p) =>
        p._id?.toLowerCase() === id || p.id?.toLowerCase() === id || p.slug?.toLowerCase() === id
    );

    if (!product) {
      throw new ApiError(`Product with ID "${id}" not found in demo catalog`, 404);
    }

    return {
      status: 'success',
      data: { product },
    } as T;
  }

  // POST /products (Create product)
  if (method === 'POST' && cleanPath === '/products') {
    const newId = `prod_demo_${Date.now()}`;
    const name = String(body.name || 'New Product');
    const slug = String(body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

    const newProduct: BackendProduct = {
      _id: newId,
      id: newId,
      name,
      slug,
      description: String(body.description || ''),
      shortDescription: body.shortDescription ? String(body.shortDescription) : undefined,
      price: Number(body.price || 0),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      costPrice: body.costPrice ? Number(body.costPrice) : undefined,
      sku: String(body.sku || `GS-${Date.now().toString().slice(-4)}`),
      category: String(body.category || 'Footwear'),
      subcategory: body.subcategory ? String(body.subcategory) : undefined,
      brand: String(body.brand || 'GASH Performance'),
      quantity: Number(body.quantity || 0),
      lowStockThreshold: Number(body.lowStockThreshold || 5),
      status: (body.status as BackendProduct['status']) || 'active',
      isFeatured: Boolean(body.isFeatured),
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : [
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
            ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentProducts.unshift(newProduct);

    return {
      status: 'success',
      data: { product: newProduct },
    } as T;
  }

  // PATCH /products/:id (Update product)
  if (method === 'PATCH' && productByIdMatch && !cleanPath.endsWith('/stock')) {
    const id = decodeURIComponent(productByIdMatch[1]);
    const index = currentProducts.findIndex((p) => p._id === id || p.id === id);

    if (index === -1) {
      throw new ApiError(`Product with ID "${id}" not found`, 404);
    }

    const updated = {
      ...currentProducts[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    currentProducts[index] = updated as BackendProduct;

    return {
      status: 'success',
      data: { product: updated },
    } as T;
  }

  // DELETE /products/:id (Delete product)
  if (method === 'DELETE' && productByIdMatch) {
    const id = decodeURIComponent(productByIdMatch[1]);
    currentProducts = currentProducts.filter((p) => p._id !== id && p.id !== id);

    return {
      status: 'success',
      data: null,
      message: 'Product deleted successfully',
    } as T;
  }

  // GET /products (list with filtering, searching, sorting, pagination)
  if (method === 'GET' && cleanPath === '/products') {
    let filtered = [...currentProducts];

    // Filter by search query
    const searchQuery = String(params?.q || params?.search || '')
      .toLowerCase()
      .trim();
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.description.toLowerCase().includes(searchQuery) ||
          p.brand?.toLowerCase().includes(searchQuery) ||
          p.category.toLowerCase().includes(searchQuery) ||
          p.sku?.toLowerCase().includes(searchQuery) ||
          p.tags?.some((t) => t.toLowerCase().includes(searchQuery))
      );
    }

    // Filter by Category
    const category = String(params?.category || '')
      .toLowerCase()
      .trim();
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category);
    }

    // Filter by Brand
    const brand = String(params?.brand || '')
      .toLowerCase()
      .trim();
    if (brand && brand !== 'all') {
      filtered = filtered.filter((p) => p.brand?.toLowerCase() === brand);
    }

    // Filter by Status
    const status = String(params?.status || '')
      .toLowerCase()
      .trim();
    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status?.toLowerCase() === status);
    }

    // Filter by Price range
    const minPrice = params?.minPrice ? Number(params.minPrice) : 0;
    const maxPrice = params?.maxPrice ? Number(params.maxPrice) : Infinity;
    if (minPrice > 0 || maxPrice < Infinity) {
      filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice);
    }

    // Sort order
    const sort = String(params?.sort || '');
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
    } else if (sort === 'newest') {
      filtered.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    } else if (sort === 'quantity-asc') {
      filtered.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
    }

    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 50);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / limit));
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      status: 'success',
      results: paginated.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
      data: {
        products: paginated,
        total: totalResults,
        page,
        limit,
      },
    } as T;
  }

  // ==========================================
  // 2. AUTHENTICATION ENDPOINTS
  // ==========================================

  // POST /auth/login
  if (method === 'POST' && cleanPath === '/auth/login') {
    const email = String(body.email || currentUser.email).toLowerCase();
    if (email.includes('seller')) {
      currentUser = JSON.parse(JSON.stringify(mockSellerUser));
    } else if (email.includes('customer')) {
      currentUser = JSON.parse(JSON.stringify(mockCustomerUser));
    } else {
      currentUser = JSON.parse(JSON.stringify(mockUser));
    }
    currentUser.email = email;

    return {
      status: 'success',
      message: 'Demo login successful',
      data: {
        user: currentUser,
        tokens: mockTokens,
      },
    } as T;
  }

  // POST /auth/register
  if (method === 'POST' && cleanPath === '/auth/register') {
    currentUser = {
      ...currentUser,
      firstName: String(body.firstName || 'Demo'),
      lastName: String(body.lastName || 'User'),
      email: String(body.email || 'admin@gash.demo'),
    };
    return {
      status: 'success',
      message: 'Demo registration successful',
      data: {
        user: currentUser,
        tokens: mockTokens,
      },
    } as T;
  }

  // POST /auth/refresh-token
  if (method === 'POST' && cleanPath === '/auth/refresh-token') {
    return {
      status: 'success',
      data: {
        tokens: mockTokens,
      },
    } as T;
  }

  // POST /auth/logout
  if (method === 'POST' && cleanPath === '/auth/logout') {
    return {
      status: 'success',
      message: 'Logged out successfully from demo session',
      data: null,
    } as T;
  }

  // POST /auth/forgot-password
  if (method === 'POST' && cleanPath === '/auth/forgot-password') {
    return {
      status: 'success',
      message: 'Password reset link sent to demo email address',
      data: null,
    } as T;
  }

  // PATCH /auth/reset-password/:token
  if (method === 'PATCH' && cleanPath.startsWith('/auth/reset-password/')) {
    return {
      status: 'success',
      message: 'Demo password reset successful',
      data: {
        user: currentUser,
        tokens: mockTokens,
      },
    } as T;
  }

  // GET /auth/verify-email/:token
  if (method === 'GET' && cleanPath.startsWith('/auth/verify-email/')) {
    currentUser.isEmailVerified = true;
    return {
      status: 'success',
      message: 'Demo email verified successfully',
      data: null,
    } as T;
  }

  // ==========================================
  // 3. USER PROFILE & ADDRESSES
  // ==========================================

  // GET /users/me
  if (method === 'GET' && cleanPath === '/users/me') {
    return {
      status: 'success',
      data: { user: currentUser },
    } as T;
  }

  // PATCH /users/me
  if (method === 'PATCH' && cleanPath === '/users/me') {
    currentUser = {
      ...currentUser,
      ...(body as Partial<UserProfile>),
      updatedAt: new Date().toISOString(),
    };
    return {
      status: 'success',
      data: { user: currentUser },
    } as T;
  }

  // PATCH /users/me/password
  if (method === 'PATCH' && cleanPath === '/users/me/password') {
    return {
      status: 'success',
      message: 'Demo password changed successfully',
      data: null,
    } as T;
  }

  // GET /users/me/addresses
  if (method === 'GET' && cleanPath === '/users/me/addresses') {
    return {
      status: 'success',
      data: { addresses: currentUser.addresses || [] },
    } as T;
  }

  // POST /users/me/addresses
  if (method === 'POST' && cleanPath === '/users/me/addresses') {
    const newAddress: UserAddress = {
      _id: `addr_demo_${Date.now()}`,
      label: String(body.label || 'Home'),
      fullName: String(body.fullName || `${currentUser.firstName} ${currentUser.lastName}`),
      addressLine1: String(body.addressLine1 || ''),
      addressLine2: body.addressLine2 ? String(body.addressLine2) : undefined,
      city: String(body.city || ''),
      state: String(body.state || ''),
      postalCode: String(body.postalCode || ''),
      country: String(body.country || 'United States'),
      phone: body.phone ? String(body.phone) : currentUser.phone,
      isDefault: Boolean(body.isDefault),
    };

    if (newAddress.isDefault && currentUser.addresses) {
      currentUser.addresses.forEach((addr) => (addr.isDefault = false));
    }

    currentUser.addresses = [...(currentUser.addresses || []), newAddress];

    return {
      status: 'success',
      data: { addresses: currentUser.addresses },
    } as T;
  }

  // PATCH /users/me/addresses/:id
  const editAddrMatch = cleanPath.match(/^\/users\/me\/addresses\/([^/]+)$/);
  if (method === 'PATCH' && editAddrMatch) {
    const addrId = decodeURIComponent(editAddrMatch[1]);
    if (currentUser.addresses) {
      currentUser.addresses = currentUser.addresses.map((addr) => {
        if (addr._id === addrId) {
          return { ...addr, ...body };
        }
        if (body.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });
    }

    return {
      status: 'success',
      data: { addresses: currentUser.addresses || [] },
    } as T;
  }

  // DELETE /users/me/addresses/:id
  const delAddrMatch = cleanPath.match(/^\/users\/me\/addresses\/([^/]+)$/);
  if (method === 'DELETE' && delAddrMatch) {
    const addrId = decodeURIComponent(delAddrMatch[1]);
    if (currentUser.addresses) {
      currentUser.addresses = currentUser.addresses.filter((addr) => addr._id !== addrId);
    }
    return {
      status: 'success',
      data: { addresses: currentUser.addresses || [] },
    } as T;
  }

  // ==========================================
  // 4. ADMIN USER DIRECTORY ENDPOINTS
  // ==========================================

  // GET /users (Admin user list)
  if (method === 'GET' && cleanPath === '/users') {
    let filtered = [...currentUsers];

    const searchQuery = String(params?.search || '')
      .toLowerCase()
      .trim();
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(searchQuery) ||
          u.lastName.toLowerCase().includes(searchQuery) ||
          u.email.toLowerCase().includes(searchQuery)
      );
    }

    const roleQuery = String(params?.role || '')
      .toLowerCase()
      .trim();
    if (roleQuery && roleQuery !== 'all') {
      filtered = filtered.filter((u) => u.role === roleQuery);
    }

    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 20);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / limit));
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      status: 'success',
      results: paginated.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
      data: {
        users: paginated,
      },
    } as T;
  }

  // GET /users/:id
  const userByIdMatch = cleanPath.match(/^\/users\/([^/]+)$/);
  if (method === 'GET' && userByIdMatch && userByIdMatch[1] !== 'me') {
    const id = decodeURIComponent(userByIdMatch[1]);
    const found = currentUsers.find((u) => u._id === id || u.id === id);

    if (!found) {
      throw new ApiError(`User "${id}" not found`, 404);
    }

    return {
      status: 'success',
      data: { user: found },
    } as T;
  }

  // PATCH /users/:id/role
  const userRoleMatch = cleanPath.match(/^\/users\/([^/]+)\/role$/);
  if (method === 'PATCH' && userRoleMatch) {
    const id = decodeURIComponent(userRoleMatch[1]);
    const found = currentUsers.find((u) => u._id === id || u.id === id);

    if (!found) {
      throw new ApiError(`User "${id}" not found`, 404);
    }

    found.role = (body.role as UserRole) || found.role;
    found.updatedAt = new Date().toISOString();

    return {
      status: 'success',
      data: { user: found },
    } as T;
  }

  // DELETE /users/:id
  if (method === 'DELETE' && userByIdMatch && userByIdMatch[1] !== 'me') {
    const id = decodeURIComponent(userByIdMatch[1]);
    currentUsers = currentUsers.filter((u) => u._id !== id && u.id !== id);

    return {
      status: 'success',
      data: null,
      message: 'User removed successfully',
    } as T;
  }

  // ==========================================
  // 5. ORDER OPERATIONS
  // ==========================================

  // POST /orders (create order)
  if (method === 'POST' && cleanPath === '/orders') {
    const orderPayload = body as unknown as CreateOrderPayload;
    const subtotal = 130;
    const shippingFee = orderPayload.shippingMethod === 'express' ? 12 : 0;
    const total = subtotal + shippingFee;

    const newOrder: Order = {
      _id: `ord_demo_${Date.now()}`,
      orderNumber: `GS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      user: {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
      },
      items: mockOrders[0]?.items || [],
      shippingAddress: orderPayload.shippingAddress,
      shippingMethod: orderPayload.shippingMethod || 'standard',
      shippingFee,
      subtotal,
      total,
      paymentMethod: orderPayload.paymentMethod || 'credit_card',
      paymentStatus: 'paid',
      status: 'confirmed',
      contactEmail: orderPayload.contactEmail || currentUser.email,
      contactPhone: orderPayload.contactPhone || currentUser.phone,
      notes: orderPayload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    currentOrders.unshift(newOrder);

    return {
      status: 'success',
      data: { order: newOrder },
    } as T;
  }

  // GET /orders/my or GET /orders
  if (method === 'GET' && (cleanPath === '/orders/my' || cleanPath === '/orders')) {
    let filtered = [...currentOrders];

    const statusParam = String(params?.status || '')
      .toLowerCase()
      .trim();
    if (statusParam && statusParam !== 'all') {
      filtered = filtered.filter((o) => o.status.toLowerCase() === statusParam);
    }

    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / limit));
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      status: 'success',
      results: paginated.length,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
      data: { orders: paginated },
    } as T;
  }

  // GET /orders/:id
  const orderByIdMatch = cleanPath.match(/^\/orders\/([^/]+)$/);
  if (method === 'GET' && orderByIdMatch) {
    const orderIdOrNum = decodeURIComponent(orderByIdMatch[1]);
    const found = currentOrders.find(
      (o) => o._id === orderIdOrNum || o.orderNumber === orderIdOrNum
    );

    if (!found) {
      throw new ApiError(`Order "${orderIdOrNum}" not found in demo records`, 404);
    }

    return {
      status: 'success',
      data: { order: found },
    } as T;
  }

  // PATCH /orders/:id/cancel
  const orderCancelMatch = cleanPath.match(/^\/orders\/([^/]+)\/cancel$/);
  if (method === 'PATCH' && orderCancelMatch) {
    const orderId = decodeURIComponent(orderCancelMatch[1]);
    const found = currentOrders.find((o) => o._id === orderId || o.orderNumber === orderId);

    if (!found) {
      throw new ApiError(`Order "${orderId}" not found`, 404);
    }

    found.status = 'cancelled';
    found.cancelReason = String(body.reason || 'Cancelled via management dashboard');
    found.cancelledAt = new Date().toISOString();
    found.updatedAt = new Date().toISOString();

    return {
      status: 'success',
      data: { order: found },
    } as T;
  }

  // PATCH /orders/:id/status
  const orderStatusMatch = cleanPath.match(/^\/orders\/([^/]+)\/status$/);
  if (method === 'PATCH' && orderStatusMatch) {
    const orderId = decodeURIComponent(orderStatusMatch[1]);
    const found = currentOrders.find((o) => o._id === orderId || o.orderNumber === orderId);

    if (!found) {
      throw new ApiError(`Order "${orderId}" not found`, 404);
    }

    found.status = (body.status as OrderStatus) || found.status;
    found.updatedAt = new Date().toISOString();

    return {
      status: 'success',
      data: { order: found },
    } as T;
  }

  // PATCH /orders/:id/payment
  const orderPaymentMatch = cleanPath.match(/^\/orders\/([^/]+)\/payment$/);
  if (method === 'PATCH' && orderPaymentMatch) {
    const orderId = decodeURIComponent(orderPaymentMatch[1]);
    const found = currentOrders.find((o) => o._id === orderId || o.orderNumber === orderId);

    if (!found) {
      throw new ApiError(`Order "${orderId}" not found`, 404);
    }

    found.paymentStatus = (body.paymentStatus as PaymentStatus) || found.paymentStatus;
    found.updatedAt = new Date().toISOString();

    return {
      status: 'success',
      data: { order: found },
    } as T;
  }

  // Fallback for unhandled demo routes: return generic success envelope
  return {
    status: 'success',
    data: {},
    message: `[Demo Mode] Endpoint ${method} ${cleanPath} simulated successfully.`,
  } as T;
}
