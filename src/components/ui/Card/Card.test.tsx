import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card component', () => {
  it('renders children inside a container div by default', () => {
    render(<Card>Card content</Card>);
    const cardEl = screen.getByText('Card content');
    expect(cardEl.tagName.toLowerCase()).toBe('div');
  });

  it('renders an anchor link when href is provided', () => {
    render(<Card href="/products/shoe">Interactive link</Card>);
    const linkEl = screen.getByRole('link', { name: 'Interactive link' });
    expect(linkEl.getAttribute('href')).toBe('/products/shoe');
  });

  it('applies variant classes accurately', () => {
    const { container } = render(
      <Card variant="subtle" className="custom-class">
        Subtle card
      </Card>
    );
    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl.className).toContain('subtle');
    expect(cardEl.className).toContain('custom-class');
  });

  it('supports disabling interactive hover elevation', () => {
    const { container } = render(<Card interactive={false}>Static card</Card>);
    const cardEl = container.firstChild as HTMLElement;
    expect(cardEl.className).not.toContain('interactive');
  });
});
