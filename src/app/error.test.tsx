import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RootError from './error';

describe('RootError Boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders root error fallback UI', () => {
    const error = new Error('Database disconnected');
    const reset = vi.fn();

    render(<RootError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { level: 2, name: /something went wrong/i })).toBeDefined();
    expect(screen.getByText(/unexpected glitch while loading this athletic gear/i)).toBeDefined();
  });

  it('calls reset when Try Again is clicked', () => {
    const error = new Error('Network failure');
    const reset = vi.fn();

    render(<RootError error={error} reset={reset} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
