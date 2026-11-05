'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  label?: React.ReactNode;
  count?: number;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onChange,
      indeterminate = false,
      label,
      count,
      disabled = false,
      hasError = false,
      className = '',
      id,
      name,
      ...props
    },
    ref
  ) => {
    return (
      <label className={cn(styles.label, disabled && styles.disabled, className)}>
        <input
          ref={ref}
          id={id}
          name={name}
          type="checkbox"
          className={styles.hiddenInput}
          checked={checked}
          disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-invalid={hasError ? true : undefined}
          onChange={(e) => onChange(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            styles.box,
            (checked || indeterminate) && styles.checked,
            hasError && styles.errorBox
          )}
          aria-hidden="true"
        >
          {indeterminate ? (
            <Minus size={12} strokeWidth={3} />
          ) : checked ? (
            <Check size={12} strokeWidth={3} />
          ) : null}
        </div>
        {label && <span className={styles.text}>{label}</span>}
        {count !== undefined && <span className={styles.count}>({count})</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
