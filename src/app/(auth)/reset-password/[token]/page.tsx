'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResetPasswordMutation } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import styles from '../../auth.module.css';

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; passwordConfirm?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const resetMutation = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; passwordConfirm?: string } = {};

    if (!password) {
      newErrors.password = 'New password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!passwordConfirm) {
      newErrors.passwordConfirm = 'Please confirm your new password';
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await resetMutation.mutateAsync({
        token,
        payload: {
          password,
          passwordConfirm,
        },
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Set New Password</h2>
        <p className={styles.formDescription}>Create a secure password for your staff account.</p>
      </div>

      {isSuccess ? (
        <div>
          <div className={styles.alertSuccess} role="status">
            Password reset successfully! Redirecting you to login...
          </div>
          <div className={styles.formFooter} style={{ justifyContent: 'center' }}>
            <Link href="/login" className={styles.link}>
              Sign in now
            </Link>
          </div>
        </div>
      ) : (
        <>
          {resetMutation.error && (
            <div className={styles.alertError} role="alert">
              {resetMutation.error.message ||
                'Invalid or expired reset token. Please request a new one.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <Input
              id="password"
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorText={errors.password}
              required
              autoComplete="new-password"
            />

            <Input
              id="passwordConfirm"
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              errorText={errors.passwordConfirm}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={resetMutation.isPending}
            >
              Update Password
            </Button>
          </form>

          <div className={styles.formFooter} style={{ justifyContent: 'center' }}>
            <Link href="/login" className={styles.link}>
              Return to Staff Sign In
            </Link>
          </div>
        </>
      )}
    </>
  );
}
