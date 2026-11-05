'use client';

import React, { useEffect } from 'react';
import { Package } from 'lucide-react';
import { ErrorView } from '@/components/ui/ErrorView/ErrorView';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrderDetailError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Order detail route error boundary caught:', error);
  }, [error]);

  return (
    <ErrorView
      title="Unable to load order details"
      description="We couldn't retrieve the receipt and shipping status for this order. Please try refreshing or return to your orders list."
      error={error}
      onRetry={reset}
      retryLabel="Retry Loading"
      secondaryAction={{
        label: 'View All Orders',
        href: '/orders',
        icon: <Package size={16} />,
      }}
      badgeText="Order Error"
    />
  );
}
