'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { Toast as ToastType, useToastStore } from '@/store/useToastStore';
import styles from './Toast.module.css';

interface ToastProps {
  toast: ToastType;
}

export function Toast({ toast }: ToastProps) {
  const { removeToast } = useToastStore();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleClose = () => {
    setIsRemoving(true);
    // Wait for the animation to finish before actually removing it from the store
    setTimeout(() => {
      removeToast(toast.id);
    }, 200); // Match the fadeOut animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={20} className={`${styles.icon} ${styles.success}`} />;
      case 'error':
        return <XCircle size={20} className={`${styles.icon} ${styles.error}`} />;
      case 'info':
      default:
        return <Info size={20} className={`${styles.icon} ${styles.info}`} />;
    }
  };

  return (
    <div className={`${styles.toast} ${isRemoving ? styles.removing : ''}`} role="alert">
      {getIcon()}
      <div className={styles.content}>
        <p className={styles.message}>{toast.message}</p>
      </div>
      <button onClick={handleClose} className={styles.closeBtn} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}
