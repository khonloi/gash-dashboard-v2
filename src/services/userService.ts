import { apiClient } from '@/lib/apiClient';
import { ApiResponse, PaginatedApiResponse } from '@/types/api';
import { UserProfile, UserAddress, UserRole, UserQueryParams, UsersResult } from '@/types/user';

export interface UpdateMePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface AddressPayload {
  label?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export const userService = {
  /**
   * Get current authenticated user profile
   */
  getMe: async (): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<{ user: UserProfile }>>('/users/me');
    return res.data.user;
  },

  /**
   * Update profile information
   */
  updateMe: async (payload: UpdateMePayload): Promise<UserProfile> => {
    const res = await apiClient.patch<ApiResponse<{ user: UserProfile }>>('/users/me', payload);
    return res.data.user;
  },

  /**
   * Change current account password
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const res = await apiClient.patch<ApiResponse<null>>('/users/me/password', payload);
    return { message: res.message || 'Password changed successfully' };
  },

  /**
   * Get user saved addresses
   */
  getAddresses: async (): Promise<UserAddress[]> => {
    const res =
      await apiClient.get<ApiResponse<{ addresses: UserAddress[] }>>('/users/me/addresses');
    return res.data.addresses;
  },

  /**
   * Add a new delivery address
   */
  addAddress: async (payload: AddressPayload): Promise<UserAddress[]> => {
    const res = await apiClient.post<ApiResponse<{ addresses: UserAddress[] }>>(
      '/users/me/addresses',
      payload
    );
    return res.data.addresses;
  },

  /**
   * Update existing address
   */
  updateAddress: async (
    addressId: string,
    payload: Partial<AddressPayload>
  ): Promise<UserAddress[]> => {
    const res = await apiClient.patch<ApiResponse<{ addresses: UserAddress[] }>>(
      `/users/me/addresses/${encodeURIComponent(addressId)}`,
      payload
    );
    return res.data.addresses;
  },

  /**
   * Remove address by ID
   */
  removeAddress: async (addressId: string): Promise<UserAddress[]> => {
    const res = await apiClient.delete<ApiResponse<{ addresses: UserAddress[] }>>(
      `/users/me/addresses/${encodeURIComponent(addressId)}`
    );
    return res?.data?.addresses || [];
  },

  /**
   * Admin: Get all users with pagination and search
   */
  getAllUsers: async (params?: UserQueryParams): Promise<UsersResult> => {
    const res = await apiClient.get<PaginatedApiResponse<{ users: UserProfile[] }>>('/users', {
      params: params as Record<string, string | number | boolean>,
    });
    return {
      users: res.data.users,
      pagination: res.pagination,
      results: res.results,
    };
  },

  /**
   * Admin: Get single user by ID
   */
  getUserById: async (id: string): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<{ user: UserProfile }>>(
      `/users/${encodeURIComponent(id)}`
    );
    return res.data.user;
  },

  /**
   * Admin: Update user role
   */
  updateUserRole: async (id: string, role: UserRole): Promise<UserProfile> => {
    const res = await apiClient.patch<ApiResponse<{ user: UserProfile }>>(
      `/users/${encodeURIComponent(id)}/role`,
      { role }
    );
    return res.data.user;
  },

  /**
   * Admin: Delete user
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${encodeURIComponent(id)}`);
  },
};
