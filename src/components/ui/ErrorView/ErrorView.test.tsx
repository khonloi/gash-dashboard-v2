import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorView } from './ErrorView';

describe('ErrorView Component', () => {
  it('renders default error view with fallback title and message', () => {
    render(<ErrorView />);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /something went wrong/i })).toBeDefined();
    expect(screen.getByText(/unexpected error occurred/i)).toBeDefined();
  });

  it('renders custom title, description, and badge', () => {
    render(
      <ErrorView
        title="Custom Failure"
        description="Detailed failure description"
        badgeText="Network Error"
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Custom Failure' })).toBeDefined();
    expect(screen.getByText('Detailed failure description')).toBeDefined();
    expect(screen.getByText('Network Error')).toBeDefined();
  });

  it('renders error digest when present', () => {
    const error = new Error('Database timeout');
    (error as Error & { digest: string }).digest = 'err_digest_9981';

    render(<ErrorView error={error} />);

    expect(screen.getByText(/Reference ID: err_digest_9981/i)).toBeDefined();
  });

  it('invokes onRetry handler when retry button is clicked', () => {
    const handleRetry = vi.fn();

    render(<ErrorView onRetry={handleRetry} retryLabel="Try Reloading" />);

    const retryButton = screen.getByRole('button', { name: /try reloading/i });
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('renders secondary navigation link action', () => {
    render(
      <ErrorView
        secondaryAction={{
          label: 'Return to Cart',
          href: '/cart',
        }}
      />
    );

    const actionLink = screen.getByRole('link', { name: /return to cart/i });
    expect(actionLink.getAttribute('href')).toBe('/cart');
  });
});
