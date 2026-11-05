import React from 'react';
import { Skeleton } from '@/components/ui';
import styles from './page.module.css';

export default function OrderDetailLoading() {
  return (
    <div className={`container ${styles.orderDetailPage}`}>
      <Skeleton className={styles.headerSkeleton} />
      <div className={styles.detailsGrid}>
        <div className={styles.mainColumn}>
          <Skeleton className={styles.orderHeaderSkeleton} />
          <Skeleton className={styles.orderItemsSkeleton} />
        </div>
        <div>
          <Skeleton className={styles.orderSummarySkeleton} />
        </div>
      </div>
    </div>
  );
}
