import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Input.module.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  inputSize?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  hasError?: boolean;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      type = 'text',
      inputSize,
      size = 'md',
      hasError = false,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const resolvedSize = inputSize || size;
    const isInvalid = hasError || Boolean(errorText);
    const helperId = id ? `${id}-helper` : undefined;
    const errorId = id ? `${id}-error` : undefined;
    const describedBy = errorText ? errorId : helperText ? helperId : props['aria-describedby'];

    const inputElement = (
      <div className={styles.wrapper}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <input
          id={id}
          type={type}
          ref={ref}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            styles.input,
            styles[resolvedSize],
            isInvalid && styles.inputError,
            leftIcon && styles.withLeftIcon,
            rightIcon && styles.withRightIcon,
            className
          )}
          {...props}
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
    );

    // If no label or helper/error text is present, return inputElement directly
    if (!label && !helperText && !errorText) {
      return inputElement;
    }

    return (
      <div className={cn(styles.container, containerClassName)}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        {inputElement}
        {errorText ? (
          <span id={errorId} className={styles.errorText} role="alert">
            {errorText}
          </span>
        ) : helperText ? (
          <span id={helperId} className={styles.helperText}>
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
