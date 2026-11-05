import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { UserProfile, AuthTokens } from '@/types/user';

describe('useAuthStore', () => {
  const mockUser: UserProfile = {
    _id: 'usr-1',
    id: 'usr-1',
    firstName: 'Marcus',
    lastName: 'Rashford',
    email: 'marcus@example.com',
    role: 'customer',
    isActive: true,
    isEmailVerified: true,
  };

  const mockTokens: AuthTokens = {
    accessToken: 'at-12345',
    refreshToken: 'rt-67890',
  };

  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('initializes in an unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuth sets user, tokens, and isAuthenticated to true', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('at-12345');
    expect(state.refreshToken).toBe('rt-67890');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setTokens updates tokens while maintaining isAuthenticated', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);

    const newTokens: AuthTokens = {
      accessToken: 'new-at-999',
      refreshToken: 'new-rt-888',
    };

    useAuthStore.getState().setTokens(newTokens);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-at-999');
    expect(state.refreshToken).toBe('new-rt-888');
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it('updateUser partially updates the authenticated user fields', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);

    useAuthStore.getState().updateUser({ firstName: 'Marcus Updated', phone: '+123456789' });

    const state = useAuthStore.getState();
    expect(state.user?.firstName).toBe('Marcus Updated');
    expect(state.user?.lastName).toBe('Rashford');
    expect(state.user?.phone).toBe('+123456789');
  });

  it('updateUser does nothing if user is null', () => {
    useAuthStore.getState().updateUser({ firstName: 'Nobody' });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('clearAuth wipes all user and token data and sets isAuthenticated to false', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('synchronizes dashboard session cookie on setAuth and clearAuth', () => {
    useAuthStore.getState().setAuth(mockUser, mockTokens);
    expect(document.cookie).toContain('gash_dashboard_session=1');

    useAuthStore.getState().clearAuth();
    // After clearing, the session cookie is expired
    expect(document.cookie).not.toContain('gash_dashboard_session=1');
  });
});
