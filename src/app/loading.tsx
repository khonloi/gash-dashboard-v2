import React from 'react';
import { Skeleton } from '@/components/ui';
import styles from './loading.module.css';

export default function RootLoading() {
  return (
    <main className={styles.main}>
      {/* Hero Banner Skeleton */}
      <Skeleton className={styles.heroSkeleton} />

      <div className={`container ${styles.section}`}>
        {/* Section Heading Skeleton */}
        <div className={styles.headingSkeleton}>
          <Skeleton className={styles.headingTitle} />
          <Skeleton className={styles.headingSubtitle} />
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className={styles.productGrid}>
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className={styles.cardSkeleton}>
              <Skeleton className={styles.cardImage} />
              <Skeleton className={styles.cardCategory} />
              <Skeleton className={styles.cardTitle} />
              <Skeleton className={styles.cardPrice} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
