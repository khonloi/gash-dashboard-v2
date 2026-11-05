'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import styles from './Select.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
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
    const isInvalid = Boolean(errorText);

    return (
      <div className={clsx(styles.container, containerClassName)}>
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
            className={clsx(
              styles.select,
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

        {errorText && <span className={styles.errorText}>{errorText}</span>}
        {!errorText && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
