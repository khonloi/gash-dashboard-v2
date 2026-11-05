import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from './page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'callbackUrl' ? '/orders' : null),
  }),
}));

const mockMutateAsync = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useLoginMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  }),
}));

vi.mock('@/lib/apiClient', () => ({
  isDemoModeActive: () => true,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form and demo accounts fill strip', () => {
    render(<LoginPage />);

    expect(screen.getByText('Staff Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Staff Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fill admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fill seller/i })).toBeInTheDocument();
  });

  it('populates fields when Fill Admin is clicked', () => {
    render(<LoginPage />);

    const fillAdminBtn = screen.getByRole('button', { name: /fill admin/i });
    fireEvent.click(fillAdminBtn);

    expect(screen.getByLabelText('Staff Email')).toHaveValue('admin@gash.demo');
    expect(screen.getByLabelText('Password')).toHaveValue('Admin123!');
  });

  it('validates required fields on submit', () => {
    render(<LoginPage />);

    const submitBtn = screen.getByRole('button', { name: /sign in to dashboard/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText('Email address is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits form with valid credentials and redirects', async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('Staff Email'), {
      target: { value: 'admin@gash.demo' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Admin123!' },
    });

    const submitBtn = screen.getByRole('button', { name: /sign in to dashboard/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'admin@gash.demo',
        password: 'Admin123!',
      });
      expect(mockPush).toHaveBeenCalledWith('/orders');
    });
  });
});
