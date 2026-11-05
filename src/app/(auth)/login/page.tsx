'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLoginMutation } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { isValidEmail } from '@/lib/validation';
import { isDemoModeActive } from '@/lib/apiClient';
import styles from '../auth.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const isDemo = isDemoModeActive();

  const loginMutation = useLoginMutation();

  const handleQuickFill = (role: 'admin' | 'seller') => {
    if (role === 'admin') {
      setEmail('admin@gash.demo');
      setPassword('Admin123!');
    } else {
      setEmail('seller@gash.demo');
      setPassword('Seller123!');
    }
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      router.push(callbackUrl);
    } catch {
      // Error is captured by loginMutation.error
    }
  };

  return (
    <>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Staff Sign In</h2>
        <p className={styles.formDescription}>
          Authorized access only for administrators and verified sellers.
        </p>
      </div>

      {isDemo && (
        <div className={styles.demoFillBar}>
          <span className={styles.demoFillLabel}>Demo Accounts:</span>
          <div className={styles.demoFillGroup}>
            <button
              type="button"
              className={styles.demoFillBtn}
              onClick={() => handleQuickFill('admin')}
              title="Fill Admin Credentials"
            >
              Fill Admin
            </button>
            <button
              type="button"
              className={styles.demoFillBtn}
              onClick={() => handleQuickFill('seller')}
              title="Fill Seller Credentials"
            >
              Fill Seller
            </button>
          </div>
        </div>
      )}

      {loginMutation.error && (
        <div className={styles.alertError} role="alert">
          {loginMutation.error.message || 'Invalid email or password. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          id="email"
          type="email"
          label="Staff Email"
          placeholder="admin@gash.demo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          errorText={errors.email}
          required
          autoComplete="email"
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          errorText={errors.password}
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={loginMutation.isPending}
        >
          Sign In to Dashboard
        </Button>
      </form>

      <div className={styles.formFooter}>
        <Link href="/forgot-password" className={styles.link}>
          Forgot password?
        </Link>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          Offline Demo Active
        </span>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
