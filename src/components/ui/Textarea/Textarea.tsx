'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  errorText?: React.ReactNode;
  helperText?: React.ReactNode;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, containerClassName, label, errorText, helperText, id, disabled, ...props },
    ref
  ) => {
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

        <textarea
          id={id}
          ref={ref}
          disabled={disabled}
          aria-invalid={isInvalid ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            styles.textarea,
            isInvalid && styles.textareaError,
            disabled && styles.textareaDisabled,
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
export default Textarea;
