'use client';

import React, { useState } from 'react';
import { User, Lock, Activity, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Input, Button, Switch, StatusBadge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { useAuthStore } from '@/store/useAuthStore';
import { useUpdateProfileMutation, useChangePasswordMutation } from '@/hooks/useUsers';
import { useToastStore } from '@/store/useToastStore';
import { isDemoModeActive, setDemoMode } from '@/lib/apiClient';
import dashboardStyles from '../dashboard.module.css';
import styles from './settings.module.css';

export function SettingsClientView() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const addToast = useToastStore((state) => state.addToast);

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Demo Mode State
  const [demoActive, setDemoActive] = useState(() => isDemoModeActive());

  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateProfileMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      updateUser(updated);
      addToast('Profile information updated successfully', 'success');
    } catch {
      addToast('Failed to update profile', 'error');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordError('');

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        newPasswordConfirm: confirmPassword,
      });
      addToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const handleToggleDemoMode = (checked: boolean) => {
    setDemoActive(checked);
    setDemoMode(checked);
    addToast(`Demo mode turned ${checked ? 'ON' : 'OFF'}. Reloading...`, 'info');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const userInitials =
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'SU';

  return (
    <div className={dashboardStyles.pageContainer}>
      {/* Header */}
      <PageHeader
        title="Account & System Settings"
        subtitle="Configure your staff profile, manage access credentials, and monitor system diagnostics."
      />

      <div className={styles.settingsGrid}>
        {/* Main Column (Forms) */}
        <div className={styles.mainCol}>
          {/* 1. Profile Information */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <User size={18} /> Staff Profile
              </h2>
              <StatusBadge status={user?.role || 'admin'} />
            </div>

            <form
              onSubmit={handleProfileSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div className={styles.formGrid2}>
                <Input
                  id="firstName"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  id="lastName"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGrid2}>
                <Input
                  id="email"
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Managed by system administrator"
                />
                <Input
                  id="phone"
                  label="Phone Number"
                  placeholder="+1 (555) 0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Input
                id="avatar"
                label="Avatar Photo URL"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: 'var(--space-2)',
                }}
              >
                <Button type="submit" variant="primary" isLoading={updateProfileMutation.isPending}>
                  Save Profile
                </Button>
              </div>
            </form>
          </section>

          {/* 2. Security & Credentials */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Lock size={18} /> Password & Security
              </h2>
            </div>

            {passwordError && (
              <div className={styles.alertError} role="alert">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <Input
                id="currentPassword"
                type="password"
                label="Current Password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              <div className={styles.formGrid2}>
                <Input
                  id="newPassword"
                  type="password"
                  label="New Password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: 'var(--space-2)',
                }}
              >
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={changePasswordMutation.isPending}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* Side Column (Identity & Diagnostics) */}
        <div className={styles.sideCol}>
          {/* Live Staff Identity Card */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Sparkles size={18} color="var(--color-primary)" /> Staff Identity
              </h2>
              <div className={styles.sessionIndicator}>
                <span className={styles.sessionDot} />
                <span>Active</span>
              </div>
            </div>

            <div className={styles.identityCardContent}>
              <div className={styles.identityAvatar}>
                {user?.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className={styles.identityAvatarImg}
                  />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>

              <div className={styles.identityInfo}>
                <h3 className={styles.identityName}>
                  {user?.firstName} {user?.lastName}
                </h3>
                <span className={styles.identityEmail}>{user?.email}</span>
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <StatusBadge status={user?.role || 'admin'} />
                </div>
              </div>

              <div className={styles.identityDetails}>
                <div className={styles.identityDetailRow}>
                  <span className={styles.identityDetailLabel}>Staff User ID</span>
                  <span className={styles.identityDetailValue}>
                    {user?._id || user?.id || 'usr_demo_admin_001'}
                  </span>
                </div>
                <div className={styles.identityDetailRow}>
                  <span className={styles.identityDetailLabel}>Auth Status</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Verified</span>
                </div>
              </div>
            </div>
          </section>

          {/* System Diagnostics */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Activity size={18} /> System Diagnostics
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-success)',
                    fontWeight: 600,
                  }}
                >
                  Secure Channel
                </span>
              </div>
            </div>

            <div className={styles.diagList}>
              <div className={styles.diagRow}>
                <span className={styles.diagLabel}>Dashboard Port & Service</span>
                <span className={styles.diagValue}>http://localhost:3001 (Isolated)</span>
              </div>

              <div className={styles.diagRow}>
                <span className={styles.diagLabel}>Backend API Gateway</span>
                <span className={styles.diagValue}>http://localhost:5000/api/v1</span>
              </div>

              <div className={styles.diagRow}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.diagLabel}>Offline Demo Mode</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    Mock data provider
                  </span>
                </div>
                <Switch
                  checked={demoActive}
                  onChange={handleToggleDemoMode}
                  aria-label="Toggle offline demo mode"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default SettingsClientView;
