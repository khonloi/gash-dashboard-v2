import { apiClient } from '@/lib/apiClient';
import { ApiResponse } from '@/types/api';
import { AuthResponseData, AuthTokens } from '@/types/user';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  password: string;
  passwordConfirm: string;
}

export const authService = {
  /**
   * Register a new account
   */
  register: async (payload: RegisterPayload): Promise<AuthResponseData> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return res.data;
  },

  /**
   * Log into an existing account
   */
  login: async (payload: LoginPayload): Promise<AuthResponseData> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return res.data;
  },

  /**
   * Refresh JWT access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const res = await apiClient.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh-token', {
      refreshToken,
    });
    return res.data.tokens;
  },

  /**
   * Log out of current session
   */
  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  /**
   * Request password reset link via email
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', {
      email,
    });
    return { message: res.message || 'Password reset email sent' };
  },

  /**
   * Reset password with reset token
   */
  resetPassword: async (
    token: string,
    payload: ResetPasswordPayload
  ): Promise<AuthResponseData> => {
    const res = await apiClient.patch<ApiResponse<AuthResponseData>>(
      `/auth/reset-password/${encodeURIComponent(token)}`,
      payload
    );
    return res.data;
  },

  /**
   * Verify email address with verification token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const res = await apiClient.get<ApiResponse<null>>(
      `/auth/verify-email/${encodeURIComponent(token)}`
    );
    return { message: res.message || 'Email verified successfully' };
  },
};
