export type OrderStatus =
  'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod = 'cod' | 'credit_card' | 'apple_pay' | 'paypal' | 'momo' | 'vnpay';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ShippingMethod = 'standard' | 'express';

export interface OrderItem {
  _id?: string;
  product:
    | {
        _id: string;
        name?: string;
        slug?: string;
        brand?: string;
        images?: { url: string; isPrimary?: boolean }[];
      }
    | string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user:
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
      }
    | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  shippingFee: number;
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  cancelledAt?: string;
  cancelReason?: string;
  deliveredAt?: string;
  shippedAt?: string;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CreateOrderPayload {
  shippingAddress: ShippingAddress;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  items?: OrderItemPayload[];
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sort?: string;
}

export interface CheckoutFormData {
  contact: string;
  country: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  phone: string;
  keepUpdated: boolean;
}

export interface CheckoutFormErrors {
  contact?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
}

export interface OrderConfirmationData {
  orderId: string;
  date: string;
  customerName: string;
  shippingAddress: string;
  total: number;
  itemCount: number;
}
