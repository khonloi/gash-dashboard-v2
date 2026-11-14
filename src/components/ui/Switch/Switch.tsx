'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Switch.module.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  name?: string;
  'aria-label'?: string;
}

export function Switch({
  checked,
  onChange,
  id,
  label,
  description,
  disabled = false,
  className,
  name,
  'aria-label': ariaLabel,
}: SwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label htmlFor={id} className={cn(styles.container, disabled && styles.disabled, className)}>
      <button
        type="button"
        role="switch"
        id={id}
        name={name}
        aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(styles.switch, checked && styles.checked)}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>

      {(label || description) && (
        <div className={styles.labelWrapper}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.description}>{description}</span>}
        </div>
      )}
    </label>
  );
}
export default Switch;
