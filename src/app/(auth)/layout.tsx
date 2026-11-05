import React from 'react';
import { BrandLogoIcon } from '@/components/ui';
import styles from './auth.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authWrapper}>
      <div className={styles.authContainer}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <BrandLogoIcon size={32} />
          </div>
          <h1 className={styles.brandTitle}>
            GASH <span>Admin</span>
          </h1>
          <p className={styles.brandSubtitle}>E-Commerce Operations & Management Portal</p>
        </div>
        <main id="main-content" className={styles.formCard}>
          {children}
        </main>
      </div>
    </div>
  );
}
