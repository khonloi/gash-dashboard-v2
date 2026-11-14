'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './StatusBadge.module.css';

export type StatusColor =
  'amber' | 'blue' | 'purple' | 'indigo' | 'emerald' | 'rose' | 'gray' | 'navy';

export interface StatusBadgeProps {
  status: string;
  label?: string;
  color?: StatusColor;
  showDot?: boolean;
  className?: string;
}

const STATUS_COLOR_MAP: Record<string, StatusColor> = {
  // Orders
  pending: 'amber',
  confirmed: 'blue',
  processing: 'purple',
  shipped: 'indigo',
  delivered: 'emerald',
  cancelled: 'rose',
  refunded: 'gray',

  // Payments
  paid: 'emerald',
  failed: 'rose',

  // Stock
  in_stock: 'emerald',
  low_stock: 'amber',
  out_of_stock: 'rose',

  // Roles
  admin: 'navy',
  seller: 'purple',
  customer: 'gray',

  // Catalog Statuses
  active: 'emerald',
  draft: 'amber',
  archived: 'gray',
  inactive: 'gray',

  // Support Chat Statuses
  bot_active: 'purple',
  queued: 'amber',
  assigned: 'blue',
  resolved: 'emerald',
  closed: 'gray',
};

export function StatusBadge({ status, label, color, showDot = true, className }: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/\s+/g, '_');
  const resolvedColor = color || STATUS_COLOR_MAP[normalizedKey] || 'gray';
  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <span className={cn(styles.badge, styles[resolvedColor], className)}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
}
export default StatusBadge;
