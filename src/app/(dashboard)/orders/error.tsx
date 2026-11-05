'use client';

import React, { useEffect } from 'react';
import { Home } from 'lucide-react';
import { ErrorView } from '@/components/ui/ErrorView/ErrorView';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OrdersError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Orders route error boundary caught:', error);
  }, [error]);

  return (
    <ErrorView
      title="Unable to load order history"
      description="We couldn't retrieve your previous purchases right now. Please verify your connection or attempt to refresh."
      error={error}
      onRetry={reset}
      retryLabel="Reload Orders"
      secondaryAction={{
        label: 'Back to Home',
        href: '/',
        icon: <Home size={16} />,
      }}
      badgeText="Orders Error"
    />
  );
}
