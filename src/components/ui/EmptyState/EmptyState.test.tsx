import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState title="No Products Found" description="Try adjusting your search criteria" />
    );

    expect(screen.getByText('No Products Found')).toBeDefined();
    expect(screen.getByText('Try adjusting your search criteria')).toBeDefined();
  });

  it('renders action button and icon', () => {
    render(
      <EmptyState
        title="Empty Cart"
        icon={<span data-testid="empty-cart-icon">🛒</span>}
        action={<button>Shop Now</button>}
      />
    );

    expect(screen.getByTestId('empty-cart-icon')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Shop Now' })).toBeDefined();
  });
});
