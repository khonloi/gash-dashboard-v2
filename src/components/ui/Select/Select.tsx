'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import styles from './Select.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  selectSize?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  label?: React.ReactNode;
  options?: SelectOption[];
  errorText?: React.ReactNode;
  helperText?: React.ReactNode;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      selectSize,
      size = 'md',
      label,
      options,
      children,
      errorText,
      helperText,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const resolvedSize = selectSize || size;
    const isInvalid = Boolean(errorText);
    const helperId = id ? `${id}-helper` : undefined;
    const errorId = id ? `${id}-error` : undefined;
    const describedBy = errorText ? errorId : helperText ? helperId : props['aria-describedby'];

    return (
      <div className={cn(styles.container, containerClassName)}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}

        <div className={styles.selectWrapper}>
          <select
            id={id}
            ref={ref}
            disabled={disabled}
            aria-invalid={isInvalid ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              styles.select,
              styles[resolvedSize],
              isInvalid && styles.selectError,
              disabled && styles.selectDisabled,
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <span className={styles.icon} aria-hidden="true">
            <ChevronDown size={16} />
          </span>
        </div>

        {errorText && (
          <span id={errorId} className={styles.errorText} role="alert">
            {errorText}
          </span>
        )}
        {!errorText && helperText && (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
