import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections/all' },
    { label: 'Running Shoes' },
  ];

  it('renders all breadcrumb items and marks the last item as current page', () => {
    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Collections')).toBeDefined();

    const currentItem = screen.getByText('Running Shoes');
    expect(currentItem).toBeDefined();
    expect(currentItem.getAttribute('aria-current')).toBe('page');
  });

  it('renders links for non-terminal items', () => {
    render(<Breadcrumb items={items} />);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink.getAttribute('href')).toBe('/');

    const collectionsLink = screen.getByRole('link', { name: 'Collections' });
    expect(collectionsLink.getAttribute('href')).toBe('/collections/all');
  });
});
