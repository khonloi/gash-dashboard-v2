import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders badge children', () => {
    render(<Badge>New Arrival</Badge>);
    expect(screen.getByText('New Arrival')).toBeDefined();
  });

  it('renders dot indicator when withDot is true', () => {
    const { container } = render(<Badge withDot>In Stock</Badge>);
    const dot = container.querySelector('span[aria-hidden="true"]');
    expect(dot).toBeDefined();
  });

  it('renders custom icon', () => {
    render(<Badge icon={<span data-testid="badge-icon">★</span>}>Featured</Badge>);
    expect(screen.getByTestId('badge-icon')).toBeDefined();
    expect(screen.getByText('Featured')).toBeDefined();
  });
});
