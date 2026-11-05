'use client';

import React, { useEffect } from 'react';
import { Home } from 'lucide-react';
import { ErrorView } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Root application error boundary caught:', error);
  }, [error]);

  return (
    <main>
      <ErrorView
        title="Something went wrong"
        description="We encountered an unexpected glitch while loading this athletic gear. Please try again or head back to the store."
        error={error}
        onRetry={reset}
        retryLabel="Try Again"
        secondaryAction={{
          label: 'Back to Home',
          href: '/',
          icon: <Home size={16} />,
        }}
      />
    </main>
  );
}
