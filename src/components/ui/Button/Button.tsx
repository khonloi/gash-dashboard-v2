import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'success'
    | 'destructive'
    | 'sharp'
    | 'pill-green'
    | 'pill-navy';
  shape?: 'rounded' | 'sharp' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: React.ElementType;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      shape,
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled = false,
      children,
      icon,
      leftIcon,
      rightIcon,
      className = '',
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    // Resolve shape: prioritize explicit shape prop, then derive from legacy variant, else default to rounded
    const resolvedShape =
      shape === 'sharp'
        ? styles.sharpShape
        : shape === 'pill'
          ? styles.pill
          : shape === 'rounded'
            ? styles.rounded
            : variant === 'sharp'
              ? styles.sharpShape
              : variant === 'pill-green' || variant === 'pill-navy'
                ? styles.pill
                : styles.rounded;

    const isInteractiveDisabled = disabled || isLoading;

    return (
      <Component
        ref={ref}
        disabled={Component === 'button' ? isInteractiveDisabled : undefined}
        aria-disabled={isInteractiveDisabled ? true : undefined}
        aria-busy={isLoading ? true : undefined}
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          resolvedShape,
          fullWidth && styles.fullWidth,
          isLoading && styles.loading,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className={cn(styles.icon, styles.spinner)} aria-hidden="true">
            <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
          </span>
        ) : leftIcon ? (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {children && <span>{children}</span>}

        {!isLoading && (rightIcon || icon) ? (
          <span className={styles.icon} aria-hidden="true">
            {rightIcon || icon}
          </span>
        ) : null}
      </Component>
    );
  }
);

Button.displayName = 'Button';
