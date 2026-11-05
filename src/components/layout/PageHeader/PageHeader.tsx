import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  badge?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  backHref,
  backLabel = 'Back',
  actions,
}: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.leftCol}>
        {backHref && (
          <Link href={backHref} className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </Link>
        )}
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badge && <div className={styles.badgeWrapper}>{badge}</div>}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
export default PageHeader;
