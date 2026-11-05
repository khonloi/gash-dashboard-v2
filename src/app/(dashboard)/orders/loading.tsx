import React from 'react';
import { Skeleton } from '@/components/ui';
import styles from './page.module.css';

export default function OrdersLoading() {
  return (
    <div className={`container ${styles.ordersPage}`}>
      <h1 className="text-headline">Orders</h1>
      <Skeleton className={styles.subtitleSkeleton} />
      <div className={styles.orderListSkeleton}>
        <Skeleton className={styles.orderCardSkeleton} />
        <Skeleton className={styles.orderCardSkeleton} />
        <Skeleton className={styles.orderCardSkeleton} />
      </div>
    </div>
  );
}
