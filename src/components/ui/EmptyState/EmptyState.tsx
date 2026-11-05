import React from 'react';
import { cn } from '@/lib/cn';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'dashed' | 'card' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'dashed',
  size = 'md',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={cn(styles.container, styles[variant], styles[size], className)}>
      {icon && <div className={styles.iconWrapper}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
