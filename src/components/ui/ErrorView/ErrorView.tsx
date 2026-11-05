'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { cn } from '@/lib/cn';
import styles from './ErrorView.module.css';

export interface SecondaryAction {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface ErrorViewProps {
  title?: string;
  description?: string;
  error?: (Error & { digest?: string }) | null;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: SecondaryAction;
  variant?: 'fullPage' | 'embedded';
  badgeText?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Standardized error feedback component for route-level and section-level error boundaries.
 */
export function ErrorView({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this content. Please try again or navigate back.',
  error,
  onRetry,
  retryLabel = 'Try Again',
  secondaryAction = {
    label: 'Back to Home',
    href: '/',
    icon: <Home size={16} />,
  },
  variant = 'fullPage',
  badgeText,
  icon = <AlertTriangle size={30} />,
  className,
}: ErrorViewProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(styles.container, styles[variant], className)}
    >
      <div className={styles.card}>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}

        {badgeText && <span className={styles.badge}>{badgeText}</span>}

        <h2 className={styles.title}>{title}</h2>

        {description && <p className={styles.description}>{description}</p>}

        {error?.digest && <p className={styles.errorDigest}>Reference ID: {error.digest}</p>}

        <div className={styles.actions}>
          {onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              icon={<RotateCcw size={16} />}
              type="button"
            >
              {retryLabel}
            </Button>
          )}

          {secondaryAction && (
            <Link href={secondaryAction.href} className={styles.actionLink}>
              <Button variant="outline" icon={secondaryAction.icon} type="button">
                {secondaryAction.label}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
