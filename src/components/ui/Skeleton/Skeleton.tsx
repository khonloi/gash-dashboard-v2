import React from 'react';
import { cn } from '@/lib/cn';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'shimmer' | 'pulse' | 'none';
  preset?: 'text' | 'avatar' | 'card' | 'button';
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  count?: number;
}

export function Skeleton({
  variant = 'rectangular',
  animation = 'shimmer',
  preset,
  width,
  height,
  borderRadius,
  count = 1,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  // Preset defaults
  let resolvedVariant = variant;
  let resolvedWidth = width;
  let resolvedHeight = height;
  let resolvedRadius = borderRadius;

  if (preset === 'avatar') {
    resolvedVariant = 'circular';
    resolvedWidth = resolvedWidth || 40;
    resolvedHeight = resolvedHeight || 40;
  } else if (preset === 'button') {
    resolvedVariant = 'rectangular';
    resolvedHeight = resolvedHeight || 40;
    resolvedRadius = resolvedRadius || '6px';
  } else if (preset === 'text') {
    resolvedVariant = 'text';
    resolvedHeight = resolvedHeight || '1em';
  } else if (preset === 'card') {
    resolvedVariant = 'rectangular';
    resolvedHeight = resolvedHeight || 200;
  }

  const animationClass =
    animation === 'pulse'
      ? styles.pulse
      : animation === 'none'
        ? styles.noAnimation
        : styles.shimmer;

  const dynamicStyle: React.CSSProperties = {
    width: typeof resolvedWidth === 'number' ? `${resolvedWidth}px` : resolvedWidth,
    height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
    borderRadius: typeof resolvedRadius === 'number' ? `${resolvedRadius}px` : resolvedRadius,
    ...style,
  };

  const renderSingle = (key?: number) => (
    <div
      key={key}
      className={cn(styles.skeleton, styles[resolvedVariant], animationClass, className)}
      style={dynamicStyle}
      aria-hidden="true"
      {...props}
    />
  );

  if (count > 1) {
    return (
      <div className={styles.wrapper} aria-hidden="true">
        {Array.from({ length: count }).map((_, index) => renderSingle(index))}
      </div>
    );
  }

  return renderSingle();
}
