'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import styles from './StatCard.module.css';

export interface StatTrend {
  value: number;
  label?: string;
  isPositive?: boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: StatTrend;
  description?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <div className={clsx(styles.card, className)}>
      <div className={styles.topRow}>
        <span className={styles.title}>{title}</span>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
      </div>

      <div className={styles.valueRow}>
        {isLoading ? (
          <div className={styles.skeletonValue} />
        ) : (
          <span className={styles.value}>{value}</span>
        )}
      </div>

      {(trend || description) && (
        <div className={styles.bottomRow}>
          {trend && (
            <span
              className={clsx(
                styles.trendBadge,
                trend.isPositive !== false ? styles.trendPositive : styles.trendNegative
              )}
            >
              {trend.isPositive !== false ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          <span>{trend?.label || description}</span>
        </div>
      )}
    </div>
  );
}
export default StatCard;
