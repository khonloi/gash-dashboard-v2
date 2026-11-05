import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { apiClient } from '@/lib/apiClient';
import { UserProfile, AuthTokens } from '@/types/user';

describe('authService', () => {
  const mockUser: UserProfile = {
    _id: 'user-1',
    id: 'user-1',
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    role: 'customer',
    isActive: true,
    isEmailVerified: true,
  };

  const mockTokens: AuthTokens = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('sends POST request to /auth/register and returns user & tokens', async () => {
      const payload = {
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@example.com',
        password: 'Password123!',
      };

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser, tokens: mockTokens },
      });

      const result = await authService.register(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', payload);
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual(mockTokens);
    });
  });

  describe('login', () => {
    it('sends POST request to /auth/login and returns user & tokens', async () => {
      const payload = {
        email: 'alex.morgan@example.com',
        password: 'Password123!',
      };

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser, tokens: mockTokens },
      });

      const result = await authService.login(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', payload);
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual(mockTokens);
    });
  });

  describe('refreshToken', () => {
    it('sends POST request to /auth/refresh-token and returns tokens', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: { tokens: mockTokens },
      });

      const result = await authService.refreshToken('old-refresh-token');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh-token', {
        refreshToken: 'old-refresh-token',
      });
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('sends POST request to /auth/logout with refreshToken', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: null,
      });

      await authService.logout('current-refresh-token');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: 'current-refresh-token',
      });
    });

    it('sends POST request to /auth/logout without refreshToken if omitted', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: null,
      });

      await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', {
        refreshToken: undefined,
      });
    });
  });

  describe('forgotPassword', () => {
    it('sends POST request to /auth/forgot-password and returns message', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        message: 'Reset link dispatched to inbox',
        data: null,
      });

      const result = await authService.forgotPassword('alex.morgan@example.com');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'alex.morgan@example.com',
      });
      expect(result.message).toBe('Reset link dispatched to inbox');
    });

    it('falls back to default message if response message is missing', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: null,
      });

      const result = await authService.forgotPassword('alex.morgan@example.com');
      expect(result.message).toBe('Password reset email sent');
    });
  });

  describe('resetPassword', () => {
    it('sends PATCH request to /auth/reset-password/:token and returns auth response', async () => {
      const payload = {
        password: 'NewSecurePassword123!',
        passwordConfirm: 'NewSecurePassword123!',
      };

      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser, tokens: mockTokens },
      });

      const result = await authService.resetPassword('secret-token#123', payload);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/auth/reset-password/secret-token%23123',
        payload
      );
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toEqual(mockTokens);
    });
  });

  describe('verifyEmail', () => {
    it('sends GET request to /auth/verify-email/:token', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 'success',
        message: 'Email successfully verified',
        data: null,
      });

      const result = await authService.verifyEmail('token-abc');

      expect(apiClient.get).toHaveBeenCalledWith('/auth/verify-email/token-abc');
      expect(result.message).toBe('Email successfully verified');
    });
  });
});
