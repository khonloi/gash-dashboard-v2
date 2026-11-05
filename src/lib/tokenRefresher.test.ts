import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { refreshAuthToken } from './tokenRefresher';
import { useAuthStore } from '@/store/useAuthStore';

describe('tokenRefresher', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().clearAuth();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    useAuthStore.getState().clearAuth();
  });

  it('returns null and clears auth when not authenticated and no refresh token exists', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const result = await refreshAuthToken();

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends refresh request with credentials include and sets new tokens upon success', async () => {
    useAuthStore.setState({
      user: {
        _id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
      },
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
      isAuthenticated: true,
    });

    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 'success',
          data: { tokens: mockTokens },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const token = await refreshAuthToken();

    expect(token).toBe('new-access-token');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledOptions] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];

    expect(calledUrl).toContain('/auth/refresh-token');
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.credentials).toBe('include');
    expect(JSON.parse(calledOptions.body)).toEqual({
      refreshToken: 'old-refresh-token',
    });

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access-token');
    expect(state.refreshToken).toBe('new-refresh-token');
  });

  it('deduplicates concurrent refresh calls into a single network request', async () => {
    useAuthStore.setState({
      refreshToken: 'concurrent-token',
      isAuthenticated: true,
    });

    const mockTokens = {
      accessToken: 'shared-access-token',
      refreshToken: 'shared-refresh-token',
    };

    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(
                  JSON.stringify({
                    status: 'success',
                    data: { tokens: mockTokens },
                  }),
                  {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                  }
                )
              ),
            10
          )
        )
    );

    const [token1, token2] = await Promise.all([refreshAuthToken(), refreshAuthToken()]);

    expect(token1).toBe('shared-access-token');
    expect(token2).toBe('shared-access-token');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('clears auth state and returns null when refresh request fails with 401', async () => {
    useAuthStore.setState({
      user: {
        _id: 'user-2',
        email: 'fail@example.com',
        firstName: 'Fail',
        lastName: 'User',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
      },
      accessToken: 'old-access-token',
      refreshToken: 'expired-refresh-token',
      isAuthenticated: true,
    });

    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'fail', message: 'Token expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const token = await refreshAuthToken();

    expect(token).toBeNull();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('supports cookie-only mode when authenticated without in-memory refresh token', async () => {
    useAuthStore.setState({
      user: {
        _id: 'user-cookie',
        email: 'cookie@example.com',
        firstName: 'Cookie',
        lastName: 'User',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
      },
      accessToken: 'cookie-access-token',
      refreshToken: null,
      isAuthenticated: true,
    });

    const mockTokens = {
      accessToken: 'cookie-refreshed-access-token',
      refreshToken: 'cookie-refreshed-refresh-token',
    };

    globalThis.fetch = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 'success',
          data: { tokens: mockTokens },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );

    const token = await refreshAuthToken();

    expect(token).toBe('cookie-refreshed-access-token');
    const [, calledOptions] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledOptions.credentials).toBe('include');
    expect(JSON.parse(calledOptions.body)).toEqual({});
  });
});
