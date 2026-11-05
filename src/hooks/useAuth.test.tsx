import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLoginMutation, useRegisterMutation, useLogoutMutation, useMeQuery } from './useAuth';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { UserProfile, AuthTokens } from '@/types/user';

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('@/services/userService', () => ({
  userService: {
    getMe: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
}

describe('useAuth hooks', () => {
  const mockUser: UserProfile = {
    _id: 'user-77',
    id: 'user-77',
    firstName: 'Serena',
    lastName: 'Williams',
    email: 'serena@example.com',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
  };

  const mockTokens: AuthTokens = {
    accessToken: 'at-token-77',
    refreshToken: 'rt-token-77',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  describe('useLoginMutation', () => {
    it('authenticates user and updates auth state on success', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens,
      });

      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        email: 'serena@example.com',
        password: 'Password123!',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authService.login).toHaveBeenCalledWith({
        email: 'serena@example.com',
        password: 'Password123!',
      });

      const authState = useAuthStore.getState();
      expect(authState.user).toEqual(mockUser);
      expect(authState.accessToken).toBe('at-token-77');
      expect(authState.isAuthenticated).toBe(true);
    });

    it('rejects customer account login with an access denied error', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        user: { ...mockUser, role: 'customer' },
        tokens: mockTokens,
      });

      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        email: 'customer@example.com',
        password: 'Password123!',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toContain('Access denied');
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('useRegisterMutation', () => {
    it('registers user and updates auth state on success', async () => {
      vi.mocked(authService.register).mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens,
      });

      const { result } = renderHook(() => useRegisterMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        firstName: 'Serena',
        lastName: 'Williams',
        email: 'serena@example.com',
        password: 'Password123!',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'Serena',
        lastName: 'Williams',
        email: 'serena@example.com',
        password: 'Password123!',
      });

      const authState = useAuthStore.getState();
      expect(authState.user).toEqual(mockUser);
      expect(authState.isAuthenticated).toBe(true);
    });
  });

  describe('useLogoutMutation', () => {
    it('clears auth store state on logout even if backend logout throws', async () => {
      useAuthStore.getState().setAuth(mockUser, mockTokens);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      vi.mocked(authService.logout).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isIdle || result.current.isSuccess).toBe(true));

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();

      const authState = useAuthStore.getState();
      expect(authState.user).toBeNull();
      expect(authState.accessToken).toBeNull();
      expect(authState.isAuthenticated).toBe(false);
    });
  });

  describe('useMeQuery', () => {
    it('does not execute query when user is not authenticated', () => {
      const { result } = renderHook(() => useMeQuery(), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(userService.getMe).not.toHaveBeenCalled();
    });

    it('fetches and updates profile when user is authenticated', async () => {
      useAuthStore.getState().setAuth(mockUser, mockTokens);

      const freshProfile: UserProfile = {
        ...mockUser,
        phone: '+1555123456',
      };

      vi.mocked(userService.getMe).mockResolvedValueOnce(freshProfile);

      const { result } = renderHook(() => useMeQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(freshProfile);
      expect(useAuthStore.getState().user?.phone).toBe('+1555123456');
    });
  });
});
