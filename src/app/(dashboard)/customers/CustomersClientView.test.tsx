import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CustomersClientView } from './CustomersClientView';
import { useAuthStore } from '@/store/useAuthStore';
import { UserProfile } from '@/types/user';

const mockUsers: UserProfile[] = [
  {
    _id: 'u1',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia@example.com',
    role: 'customer',
    isActive: true,
    isEmailVerified: true,
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    _id: 'u2',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus@example.com',
    role: 'seller',
    isActive: true,
    isEmailVerified: true,
    createdAt: '2026-01-10T00:00:00.000Z',
  },
  {
    _id: 'admin-1',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'admin@gash.demo',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

vi.mock('@/hooks/useUsers', () => ({
  useUsersQuery: () => ({
    data: {
      users: mockUsers,
      pagination: { totalResults: 3 },
    },
    isLoading: false,
  }),
  useUpdateUserRoleMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteUserMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('CustomersClientView', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        _id: 'admin-1',
        email: 'admin@gash.demo',
        firstName: 'Elena',
        lastName: 'Rostova',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
      },
      isAuthenticated: true,
    });
  });

  it('renders users directory and action buttons', () => {
    render(<CustomersClientView />);

    expect(screen.getByText('Users & Customers Directory')).toBeDefined();
    expect(screen.getByText('Sophia Chen')).toBeDefined();
    expect(screen.getByText('sophia@example.com')).toBeDefined();
    expect(screen.getByText('Marcus Vance')).toBeDefined();
    expect(screen.getByText('Elena Rostova')).toBeDefined();

    // Verify self-protection indicator
    expect(screen.getByText('You')).toBeDefined();
    const selfDeleteBtn = screen.getByLabelText('Delete Elena') as HTMLButtonElement;
    expect(selfDeleteBtn.disabled).toBe(true);
    expect(selfDeleteBtn.title).toBe('Cannot delete active administrator session');

    // Verify change role button
    expect(screen.getByLabelText('Change role for Sophia')).toBeDefined();
  });

  it('opens change role modal when shield icon clicked', () => {
    render(<CustomersClientView />);

    const roleBtn = screen.getByLabelText('Change role for Sophia');
    fireEvent.click(roleBtn);

    expect(screen.getByText('Change User Privileges')).toBeDefined();
    expect(screen.getByText('Save New Role')).toBeDefined();
  });
});
