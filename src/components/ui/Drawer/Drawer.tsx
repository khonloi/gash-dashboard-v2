'use client';

import React, { useEffect, useId, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/lib/cn';
import styles from './Drawer.module.css';

const emptySubscribe = () => () => {};

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeOnBackdrop?: boolean;
  closeLabel?: string;
  ariaLabel?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
  bodyClassName,
  footerClassName,
  closeOnBackdrop = true,
  closeLabel = 'Close drawer',
  ariaLabel,
}: DrawerProps) {
  const titleId = useId();
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!hasMounted || !isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleBackdropClick} role="presentation">
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        className={cn(
          styles.drawer,
          size === 'sm' && styles.drawerSm,
          size === 'lg' && styles.drawerLg,
          className
        )}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X size={18} />
          </button>
        </div>

        <div className={cn(styles.body, bodyClassName)}>{children}</div>

        {footer && <div className={cn(styles.footer, footerClassName)}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
export default Drawer;
