import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RoleGuard } from './RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';

describe('RoleGuard Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        _id: '1',
        id: '1',
        email: 'seller@gash.demo',
        firstName: 'Seller',
        lastName: 'One',
        role: 'seller',
        isActive: true,
        isEmailVerified: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
    });
  });

  it('renders children when user role is allowed', () => {
    render(
      <RoleGuard allowedRoles={['seller', 'admin']}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeDefined();
  });

  it('renders access restricted message when user role is not allowed', () => {
    render(
      <RoleGuard allowedRoles={['admin']}>
        <div>Admin Only Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Admin Only Content')).toBeNull();
    expect(screen.getByText('Access Restricted')).toBeDefined();
    expect(screen.getByRole('link', { name: /return to overview/i })).toBeDefined();
  });
});
