import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SettingsClientView } from './SettingsClientView';
import { useAuthStore } from '@/store/useAuthStore';
import * as apiClient from '@/lib/apiClient';

const mockMutateProfile = vi.fn();
const mockMutatePassword = vi.fn();

vi.mock('@/hooks/useUsers', () => ({
  useUpdateProfileMutation: () => ({
    mutateAsync: mockMutateProfile,
    isPending: false,
  }),
  useChangePasswordMutation: () => ({
    mutateAsync: mockMutatePassword,
    isPending: false,
  }),
}));

describe('SettingsClientView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        _id: 'usr_admin_001',
        firstName: 'Alexander',
        lastName: 'Wright',
        email: 'alex.wright@gash.luxury',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        phone: '+1 (555) 0199',
      },
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh-token',
      isAuthenticated: true,
    });
  });

  it('renders staff profile information correctly', () => {
    render(<SettingsClientView />);

    expect(screen.getByText('Account & System Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toHaveValue('Alexander');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Wright');
    expect(screen.getByLabelText('Email Address')).toHaveValue('alex.wright@gash.luxury');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('+1 (555) 0199');
  });

  it('submits updated profile data', async () => {
    mockMutateProfile.mockResolvedValueOnce({
      _id: 'usr_admin_001',
      firstName: 'Alexander Jr.',
      lastName: 'Wright',
      email: 'alex.wright@gash.luxury',
      role: 'admin',
    });

    render(<SettingsClientView />);

    const firstNameInput = screen.getByLabelText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'Alexander Jr.' } });

    const saveButton = screen.getByRole('button', { name: /save profile/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateProfile).toHaveBeenCalledWith({
        firstName: 'Alexander Jr.',
        lastName: 'Wright',
        phone: '+1 (555) 0199',
        avatar: undefined,
      });
    });
  });

  it('validates password mismatch before calling mutation', async () => {
    render(<SettingsClientView />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'DifferentPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    expect(mockMutatePassword).not.toHaveBeenCalled();
  });

  it('submits valid password changes', async () => {
    mockMutatePassword.mockResolvedValueOnce({});
    render(<SettingsClientView />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewSecret123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'NewSecret123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(mockMutatePassword).toHaveBeenCalledWith({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewSecret123!',
        newPasswordConfirm: 'NewSecret123!',
      });
    });
  });

  it('displays environment diagnostics and handles demo mode toggle', () => {
    const setDemoSpy = vi.spyOn(apiClient, 'setDemoMode');
    render(<SettingsClientView />);

    expect(screen.getByText('http://localhost:3001 (Isolated)')).toBeInTheDocument();
    expect(screen.getByText('http://localhost:5000/api/v1')).toBeInTheDocument();

    const switchToggle = screen.getByRole('switch', { name: /toggle offline demo mode/i });
    expect(switchToggle).toBeInTheDocument();

    fireEvent.click(switchToggle);
    expect(setDemoSpy).toHaveBeenCalled();
  });
});
