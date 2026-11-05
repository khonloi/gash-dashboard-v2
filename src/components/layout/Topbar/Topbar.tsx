'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogoutMutation } from '@/hooks/useAuth';
import { DemoModeBanner } from '@/components/common';
import styles from './Topbar.module.css';

export interface TopbarProps {
  onOpenMobileSidebar?: () => void;
}

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return [{ label: 'Overview', href: '/' }];
    }

    const items = [{ label: 'Dashboard', href: '/' }];
    let accumulatedPath = '';

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      accumulatedPath += `/${seg}`;

      // Custom formatting for common dashboard routes
      let label = seg.charAt(0).toUpperCase() + seg.slice(1);
      if (seg === 'products') label = 'Products';
      else if (seg === 'inventory') label = 'Inventory';
      else if (seg === 'orders') label = 'Orders';
      else if (seg === 'customers') label = 'Customers';
      else if (seg === 'settings') label = 'Settings';
      else if (seg === 'new') label = 'New Item';
      else if (seg === 'edit') label = 'Edit';

      items.push({ label, href: accumulatedPath });
    }

    return items;
  }, [pathname]);

  const initials = useMemo(() => {
    if (!user) return 'GA';
    const first = user.firstName ? user.firstName[0] : '';
    const last = user.lastName ? user.lastName[0] : '';
    return `${first}${last}`.toUpperCase() || 'GA';
  }, [user]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className={styles.topbar} aria-label="Dashboard Topbar">
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onOpenMobileSidebar}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && <ChevronRight size={14} className={styles.breadcrumbSeparator} />}
                {isLast ? (
                  <span className={styles.breadcrumbCurrent} aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className={styles.breadcrumbLink}>
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className={styles.rightSection}>
        {/* Backend health / demo mode control badge */}
        <DemoModeBanner inline />

        {/* User Card */}
        <div className={styles.userCard}>
          <div className={styles.avatar} aria-hidden="true">
            {initials}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user ? `${user.firstName} ${user.lastName}` : 'Staff User'}
            </span>
            <span className={styles.userRole}>{user?.role || 'admin'}</span>
          </div>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            aria-label="Log out of staff session"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
export default Topbar;
