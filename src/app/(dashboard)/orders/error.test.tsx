import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersError from './error';

describe('OrdersError Boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders orders error and allows retry and home navigation', () => {
    const error = new Error('Orders query failed');
    const reset = vi.fn();

    render(<OrdersError error={error} reset={reset} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /unable to load order history/i })
    ).toBeDefined();
    expect(screen.getByText('Orders Error')).toBeDefined();

    const reloadButton = screen.getByRole('button', { name: /reload orders/i });
    fireEvent.click(reloadButton);
    expect(reset).toHaveBeenCalledTimes(1);

    const homeLink = screen.getByRole('link', { name: /back to home/i });
    expect(homeLink.getAttribute('href')).toBe('/');
  });
});
