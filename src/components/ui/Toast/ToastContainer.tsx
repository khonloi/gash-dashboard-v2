'use client';

import React from 'react';
import { useToastStore } from '@/store/useToastStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Toast } from './Toast';
import styles from './Toast.module.css';

export function ToastContainer() {
  const { toasts } = useToastStore();
  const mounted = useIsMounted();

  if (!mounted || toasts.length === 0) return null;

  return (
    <div className={styles.container} role="status" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
