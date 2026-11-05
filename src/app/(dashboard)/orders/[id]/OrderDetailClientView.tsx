'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  useOrderQuery,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from '@/hooks/useOrders';
import { useToastStore } from '@/store/useToastStore';
import { Button, StatusBadge, EmptyState, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { formatPrice, formatDateTime } from '@/lib/format';
import { OrderStatus, PaymentStatus } from '@/types/order';
import clsx from 'clsx';
import styles from './page.module.css';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Dispatched' },
  { status: 'delivered', label: 'Delivered' },
];

const VALID_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'processing', 'shipped', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

function getPaymentMethodLabel(method: string) {
  switch (method) {
    case 'credit_card':
      return 'Credit / Debit Card (Visa, Mastercard, AMEX)';
    case 'apple_pay':
      return 'Apple Pay';
    case 'paypal':
      return 'PayPal';
    case 'cod':
      return 'Cash on Delivery (COD)';
    default:
      return method.replace('_', ' ').toUpperCase();
  }
}

export default function OrderDetailClientView({ orderId }: { orderId: string }) {
  const { data: currentOrder, isLoading, error } = useOrderQuery(orderId);
  const cancelOrderMutation = useCancelOrderMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updatePaymentMutation = useUpdatePaymentStatusMutation();
  const { addToast } = useToastStore();

  const handleCancelOrder = async () => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Are you sure you want to cancel this order?')
    ) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({ orderId, reason: 'User requested cancellation' });
      addToast('Order cancelled successfully', 'success');
    } catch {
      addToast('Failed to cancel order', 'error');
    }
  };

  const handleStatusTransition = async (nextStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: nextStatus });
      addToast(`Order fulfillment status updated to ${nextStatus}`, 'success');
    } catch {
      addToast('Failed to update order status', 'error');
    }
  };

  const handleUpdatePayment = async (newPaymentStatus: PaymentStatus) => {
    try {
      await updatePaymentMutation.mutateAsync({ orderId, paymentStatus: newPaymentStatus });
      addToast(`Payment status updated to ${newPaymentStatus}`, 'success');
    } catch {
      addToast('Failed to update payment status', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.orderDetailPage}>
        <Skeleton className={styles.headerSkeleton} />
        <div className={styles.detailsGrid}>
          <div className={styles.mainColumn}>
            <Skeleton className={styles.orderHeaderSkeleton} />
            <Skeleton className={styles.orderItemsSkeleton} />
          </div>
          <div>
            <Skeleton className={styles.orderSummarySkeleton} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentOrder) {
    return (
      <div className={styles.orderDetailPage}>
        <EmptyState
          title="Order Not Found"
          description="We couldn't find the order you're looking for."
          action={
            <Button as={Link} href="/orders" variant="primary">
              Back to Orders
            </Button>
          }
        />
      </div>
    );
  }

  const order = currentOrder;
  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const allowedTransitions = VALID_ORDER_STATUS_TRANSITIONS[order.status] || [];

  const currentStepIdx = STEPS.findIndex((s) => s.status === order.status);
  const isTerminalNegative = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className={styles.orderDetailPage}>
      <PageHeader
        title={`Order #${order.orderNumber}`}
        subtitle={`Placed on ${formatDateTime(order.createdAt)}`}
        backHref="/orders"
        backLabel="Back to Orders"
        badge={<StatusBadge status={order.status} />}
        actions={
          canCancel ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelOrder}
              isLoading={cancelOrderMutation.isPending}
            >
              Cancel Order
            </Button>
          ) : null
        }
      />

      {/* Fulfillment Stepper Card */}
      <section className={styles.stepperCard}>
        <div className={styles.stepperHeader}>
          <h2 className={styles.stepperTitle}>Fulfillment Progression</h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Current Status: <StatusBadge status={order.status} />
          </span>
        </div>

        {isTerminalNegative ? (
          <div className={styles.cancelReasonBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <strong className={styles.cancelReasonTitle}>This order was {order.status}.</strong>
            </div>
            {order.cancelReason && (
              <p style={{ margin: '6px 0 0' }}>Reason: {order.cancelReason}</p>
            )}
          </div>
        ) : (
          <div className={styles.stepperContainer} aria-label="Fulfillment Progress">
            <div className={styles.stepperTrack}>
              <div
                className={styles.stepperTrackFill}
                style={{
                  width: `${Math.max(0, (currentStepIdx / (STEPS.length - 1)) * 100)}%`,
                }}
              />
            </div>

            {STEPS.map((step, idx) => {
              const isDone = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={step.status} className={styles.stepItem}>
                  <div
                    className={clsx(
                      styles.stepCircle,
                      isDone && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleActive
                    )}
                  >
                    {isDone ? <Check size={14} /> : idx + 1}
                  </div>
                  <span
                    className={clsx(
                      styles.stepLabel,
                      (isDone || isCurrent) && styles.stepLabelActive
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Operational Transitions */}
        <div className={styles.stepperActions}>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              marginRight: '4px',
            }}
          >
            Available Transitions:
          </span>
          {allowedTransitions.map((nextStatus) => {
            if (nextStatus === 'cancelled') return null;
            return (
              <Button
                key={nextStatus}
                variant="primary"
                size="sm"
                onClick={() => handleStatusTransition(nextStatus)}
                isLoading={updateStatusMutation.isPending}
              >
                Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              </Button>
            );
          })}
          {order.paymentStatus !== 'paid' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleUpdatePayment('paid')}
              isLoading={updatePaymentMutation.isPending}
            >
              <CheckCircle2 size={14} /> Mark Payment as Paid
            </Button>
          )}
        </div>
      </section>

      <div className={styles.detailsGrid}>
        <div className={styles.mainColumn}>
          {/* Items List */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Items Ordered</h2>
            <div className={styles.itemsList}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <div className={styles.itemImageWrap}>
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.itemImagePlaceholder}>No Img</div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <div>
                      <h3 className={styles.itemTitle}>{item.name}</h3>
                      <p className={styles.itemSku}>SKU: {item.sku}</p>
                      {(item.size || item.color) && (
                        <p className={styles.itemVariant}>
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && item.color && <span> | </span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </p>
                      )}
                      <p className={styles.itemQty}>Quantity: {item.quantity}</p>
                    </div>
                    <div className={styles.itemPriceCol}>
                      {formatPrice(item.price * item.quantity)}
                      {item.quantity > 1 && (
                        <p className={styles.itemUnitPrice}>{formatPrice(item.price)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          {/* Summary */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Order Summary</h2>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping ({order.shippingMethod})</span>
                <span>{order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Free'}</span>
              </div>
              <div className={styles.summaryRowTotal}>
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className={styles.card}>
            <div className={styles.infoSection}>
              <h2 className={styles.infoTitle}>Shipping Details</h2>
              <div className={styles.infoText}>
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
                  {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ''}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h2 className={styles.infoTitle}>Payment Details</h2>
              <div className={styles.infoText}>
                <p>Method: {getPaymentMethodLabel(order.paymentMethod)}</p>
                <p>
                  Status: <StatusBadge status={order.paymentStatus} />
                </p>
              </div>
            </div>

            {(order.contactEmail || order.contactPhone) && (
              <div className={styles.infoSection}>
                <h2 className={styles.infoTitle}>Contact Info</h2>
                <div className={styles.infoText}>
                  {order.contactEmail && <p>{order.contactEmail}</p>}
                  {order.contactPhone && <p>{order.contactPhone}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
