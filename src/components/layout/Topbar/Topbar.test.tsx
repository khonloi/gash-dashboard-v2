import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/store/useAuthStore';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/products',
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockLogoutMutateAsync = vi.fn().mockResolvedValue(undefined);
vi.mock('@/hooks/useAuth', () => ({
  useLogoutMutation: () => ({
    mutateAsync: mockLogoutMutateAsync,
    isPending: false,
  }),
}));

describe('Topbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        _id: '1',
        id: '1',
        email: 'admin@gash.demo',
        firstName: 'Elena',
        lastName: 'Rostova',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      isAuthenticated: true,
    });
  });

  it('renders breadcrumbs and user info correctly', () => {
    render(<Topbar />);

    expect(screen.getByText('Elena Rostova')).toBeDefined();
    expect(screen.getByText('admin')).toBeDefined();
    expect(screen.getByText('ER')).toBeDefined();
    expect(screen.getByText('Products')).toBeDefined();
  });

  it('invokes logout when Sign Out is clicked', async () => {
    render(<Topbar />);

    const logoutBtn = screen.getByRole('button', { name: /log out of staff session/i });
    fireEvent.click(logoutBtn);

    expect(mockLogoutMutateAsync).toHaveBeenCalledTimes(1);
  });
});
