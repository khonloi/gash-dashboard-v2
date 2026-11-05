'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForgotPasswordMutation } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { isValidEmail } from '@/lib/validation';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotMutation = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Staff email address is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please provide a valid email address');
      return;
    }

    setError('');
    try {
      await forgotMutation.mutateAsync(email.trim());
      setIsSubmitted(true);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Reset Staff Password</h2>
        <p className={styles.formDescription}>
          Enter your authorized staff email to receive recovery instructions.
        </p>
      </div>

      {isSubmitted ? (
        <div>
          <div className={styles.alertSuccess} role="status">
            Password reset instructions have been dispatched to <strong>{email}</strong>. Please
            check your inbox.
          </div>
          <div className={styles.formFooter} style={{ justifyContent: 'center' }}>
            <Link href="/login" className={styles.link}>
              Return to Staff Sign In
            </Link>
          </div>
        </div>
      ) : (
        <>
          {forgotMutation.error && (
            <div className={styles.alertError} role="alert">
              {forgotMutation.error.message ||
                'Unable to process reset request. Please verify email.'}
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
              errorText={error}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={forgotMutation.isPending}
            >
              Send Reset Link
            </Button>
          </form>

          <div className={styles.formFooter} style={{ justifyContent: 'center' }}>
            <Link href="/login" className={styles.link}>
              &larr; Back to Staff Sign In
            </Link>
          </div>
        </>
      )}
    </>
  );
}
