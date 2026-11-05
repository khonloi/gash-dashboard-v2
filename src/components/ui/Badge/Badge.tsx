import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md';
  withDot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  withDot = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(styles.badge, styles[variant], styles[size], className)} {...props}>
      {withDot && <span className={styles.dot} aria-hidden="true" />}
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}
