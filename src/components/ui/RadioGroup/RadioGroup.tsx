'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './RadioGroup.module.css';

export interface RadioOption {
  value: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  rightElement?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  label,
  error,
  className = '',
  'aria-label': ariaLabel,
}: RadioGroupProps) {
  const labelId = label ? `${name}-group-label` : undefined;
  const errorId = error ? `${name}-group-error` : undefined;

  const groupNode = (
    <div
      className={cn(styles.group, className)}
      role="radiogroup"
      aria-labelledby={labelId}
      aria-label={ariaLabel}
      aria-describedby={errorId}
      aria-invalid={error ? true : undefined}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              styles.option,
              isSelected && styles.selected,
              opt.disabled && styles.disabled
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              disabled={opt.disabled}
              aria-checked={isSelected}
              onChange={() => onChange(opt.value)}
              className={styles.radioInput}
            />
            <div className={styles.content}>
              <span className={styles.title}>{opt.title}</span>
              {opt.description && <span className={styles.description}>{opt.description}</span>}
            </div>
            {opt.rightElement && <div className={styles.right}>{opt.rightElement}</div>}
          </label>
        );
      })}
    </div>
  );

  if (!label && !error) {
    return groupNode;
  }

  return (
    <div className={styles.container}>
      {label && (
        <span id={labelId} className={styles.groupLabel}>
          {label}
        </span>
      )}
      {groupNode}
      {error && (
        <span id={errorId} className={styles.groupError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
