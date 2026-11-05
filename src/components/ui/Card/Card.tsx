import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
  variant?: 'default' | 'subtle' | 'elevated' | 'plain';
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ href, variant = 'default', interactive = true, className, children, ...rest }, ref) => {
    const cardClass = cn(
      styles.card,
      styles[variant],
      interactive && styles.interactive,
      className
    );

    if (href) {
      return (
        <Link
          href={href}
          className={cardClass}
          ref={ref as unknown as React.Ref<HTMLAnchorElement>}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }

    return (
      <div ref={ref} className={cardClass} {...rest}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
