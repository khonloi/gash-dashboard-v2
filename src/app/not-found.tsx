import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './not-found.module.css';

export default function RootNotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <span className={styles.errorCode}>404</span>

        <h1 className={styles.title}>Gear Not Found</h1>

        <p className={styles.description}>
          The page or product you are looking for might have been moved, sold out, or does not exist
          in our catalog.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.actionLink}>
            <Button variant="primary" icon={<Home size={16} />}>
              Return Home
            </Button>
          </Link>

          <Link href="/collections/all" className={styles.actionLink}>
            <Button variant="outline" icon={<Compass size={16} />}>
              Browse All Products
            </Button>
          </Link>
        </div>

        <div className={styles.destinationsSection}>
          <p className={styles.destinationsTitle}>Popular Destinations</p>
          <div className={styles.destinationsList}>
            {[
              { label: 'Running', href: '/collections/running' },
              { label: 'Training', href: '/collections/training' },
              { label: 'Swimming', href: '/collections/swimming' },
              { label: 'Outdoor', href: '/collections/outdoor' },
            ].map((col) => (
              <Link key={col.label} href={col.href} className={styles.destinationChip}>
                <span>{col.label}</span>
                <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
