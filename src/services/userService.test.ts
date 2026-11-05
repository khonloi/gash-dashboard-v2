import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService, AddressPayload } from './userService';
import { apiClient } from '@/lib/apiClient';
import { UserProfile, UserAddress } from '@/types/user';

describe('userService', () => {
  const mockUser: UserProfile = {
    _id: 'user-001',
    id: 'user-001',
    firstName: 'Kylian',
    lastName: 'Mbappe',
    email: 'kylian@example.com',
    role: 'customer',
    isActive: true,
    isEmailVerified: true,
  };

  const mockAddress: UserAddress = {
    _id: 'addr-01',
    label: 'Home',
    fullName: 'Kylian Mbappe',
    addressLine1: '10 Champs-Elysees',
    city: 'Paris',
    state: 'Ile-de-France',
    postalCode: '75008',
    country: 'France',
    isDefault: true,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMe', () => {
    it('fetches authenticated user profile', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser },
      });

      const result = await userService.getMe();

      expect(apiClient.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMe', () => {
    it('updates user profile information', async () => {
      const updatedUser: UserProfile = {
        ...mockUser,
        phone: '+33123456789',
      };

      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        status: 'success',
        data: { user: updatedUser },
      });

      const result = await userService.updateMe({ phone: '+33123456789' });

      expect(apiClient.patch).toHaveBeenCalledWith('/users/me', { phone: '+33123456789' });
      expect(result.phone).toBe('+33123456789');
    });
  });

  describe('changePassword', () => {
    it('sends patch request to change password', async () => {
      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        status: 'success',
        message: 'Password updated',
        data: null,
      });

      const result = await userService.changePassword({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirm: 'NewPassword123!',
      });

      expect(apiClient.patch).toHaveBeenCalledWith('/users/me/password', {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirm: 'NewPassword123!',
      });
      expect(result.message).toBe('Password updated');
    });
  });

  describe('address management', () => {
    it('getAddresses fetches saved addresses', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        status: 'success',
        data: { addresses: [mockAddress] },
      });

      const result = await userService.getAddresses();

      expect(apiClient.get).toHaveBeenCalledWith('/users/me/addresses');
      expect(result).toEqual([mockAddress]);
    });

    it('addAddress creates a new address', async () => {
      const payload: AddressPayload = {
        fullName: 'Kylian Mbappe',
        addressLine1: '10 Champs-Elysees',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        state: 'Ile-de-France',
      };

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 'success',
        data: { addresses: [mockAddress] },
      });

      const result = await userService.addAddress(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/users/me/addresses', payload);
      expect(result).toEqual([mockAddress]);
    });

    it('updateAddress patches existing address with encoded ID', async () => {
      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        status: 'success',
        data: { addresses: [mockAddress] },
      });

      const result = await userService.updateAddress('addr/01', { label: 'Office' });

      expect(apiClient.patch).toHaveBeenCalledWith('/users/me/addresses/addr%2F01', {
        label: 'Office',
      });
      expect(result).toEqual([mockAddress]);
    });

    it('removeAddress deletes address with encoded ID', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
        status: 'success',
        data: { addresses: [] },
      });

      const result = await userService.removeAddress('addr-01');

      expect(apiClient.delete).toHaveBeenCalledWith('/users/me/addresses/addr-01');
      expect(result).toEqual([]);
    });
  });
});
