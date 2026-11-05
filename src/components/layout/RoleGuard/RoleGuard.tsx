'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui';
import styles from './RoleGuard.module.css';

const emptySubscribe = () => () => {};

export interface RoleGuardProps {
  allowedRoles: ('admin' | 'seller')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!hasMounted) {
    return null; // Avoid hydration mismatch
  }

  const role = user?.role;
  const isAllowed = role ? allowedRoles.includes(role as 'admin' | 'seller') : false;

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <ShieldAlert size={32} />
        </div>
        <h2 className={styles.title}>Access Restricted</h2>
        <p className={styles.message}>
          This section requires privileges reserved for <strong>{allowedRoles.join(' or ')}</strong>
          . Your current role is <strong>{role || 'unassigned'}</strong>.
        </p>
        <div className={styles.actions}>
          <Button as={Link} href="/" variant="primary" size="md">
            Return to Overview
          </Button>
        </div>
      </div>
    </div>
  );
}
export default RoleGuard;
