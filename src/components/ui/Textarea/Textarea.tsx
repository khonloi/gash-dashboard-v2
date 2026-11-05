'use client';

import React from 'react';
import clsx from 'clsx';
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

    return (
      <div className={clsx(styles.container, containerClassName)}>
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
          className={clsx(
            styles.textarea,
            isInvalid && styles.textareaError,
            disabled && styles.textareaDisabled,
            className
          )}
          {...props}
        />

        {errorText && <span className={styles.errorText}>{errorText}</span>}
        {!errorText && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
