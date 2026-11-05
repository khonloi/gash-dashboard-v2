import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Divider.module.css';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'subtle';
  children?: React.ReactNode;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  children,
  className = '',
  ...props
}: DividerProps) {
  if (children && orientation === 'horizontal') {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn(styles.withLabel, styles[variant], className)}
        {...props}
      >
        <span className={styles.label}>{children}</span>
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(styles.divider, styles[orientation], styles[variant], className)}
      {...props}
    />
  );
}
