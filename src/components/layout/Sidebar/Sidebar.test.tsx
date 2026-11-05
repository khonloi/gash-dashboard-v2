import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/useAuthStore';

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation items for admin role', () => {
    useAuthStore.setState({
      user: {
        _id: '1',
        id: '1',
        email: 'admin@gash.demo',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
    });

    render(<Sidebar />);

    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Products')).toBeDefined();
    expect(screen.getByText('Inventory')).toBeDefined();
    expect(screen.getByText('Orders')).toBeDefined();
    expect(screen.getByText('Customers')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('hides admin-only navigation items for seller role', () => {
    useAuthStore.setState({
      user: {
        _id: '2',
        id: '2',
        email: 'seller@gash.demo',
        firstName: 'Seller',
        lastName: 'User',
        role: 'seller',
        isActive: true,
        isEmailVerified: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
    });

    render(<Sidebar />);

    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Products')).toBeDefined();
    expect(screen.getByText('Inventory')).toBeDefined();
    expect(screen.queryByText('Orders')).toBeNull();
    expect(screen.queryByText('Customers')).toBeNull();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  it('marks active link based on current path', () => {
    useAuthStore.setState({
      user: {
        _id: '1',
        id: '1',
        email: 'admin@gash.demo',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
    });

    render(<Sidebar />);

    const productsLink = screen.getByRole('link', { name: /products/i });
    expect(productsLink.getAttribute('aria-current')).toBe('page');
  });
});
