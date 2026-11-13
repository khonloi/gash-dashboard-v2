'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Settings,
  Headphones,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { BrandLogoIcon } from '@/components/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import clsx from 'clsx';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Boxes,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    adminOnly: true,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    adminOnly: true,
  },
  {
    label: 'Live Support',
    href: '/support',
    icon: Headphones,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const role = user?.role || 'admin';

  const trapRef = useFocusTrap<HTMLElement>(isMobileOpen, onMobileClose);

  // Filter out admin-only items if current user is seller
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && role === 'seller') return false;
    return true;
  });

  const isItemActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={clsx(styles.mobileOverlay, isMobileOpen && styles.mobileOverlayOpen)}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        ref={trapRef}
        className={clsx(
          styles.sidebar,
          isCollapsed && styles.sidebarCollapsed,
          isMobileOpen && styles.sidebarMobileOpen
        )}
        aria-label="Sidebar navigation"
      >
        <div className={styles.header}>
          <Link href="/" className={styles.brandLink} onClick={onMobileClose}>
            <div className={styles.logoIcon}>
              <BrandLogoIcon size={22} />
            </div>
            {!isCollapsed && (
              <div className={styles.brandMeta}>
                <div className={styles.brandName}>
                  GASH <span>Admin</span>
                </div>
                <div className={styles.brandRoleBadge}>{role}</div>
              </div>
            )}
          </Link>

          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              className={styles.headerCollapseBtn}
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {isMobileOpen && (
            <button
              type="button"
              className={styles.collapseButton}
              onClick={onMobileClose}
              aria-label="Close sidebar navigation"
              style={{ width: 'auto', padding: '6px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {!isCollapsed && <div className={styles.navSectionTitle}>Main Menu</div>}

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(styles.navLink, active && styles.navLinkActive)}
                onClick={onMobileClose}
                title={isCollapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={styles.navIcon} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {onToggleCollapse && (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.collapseButton}
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {!isCollapsed && <span>Collapse</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
export default Sidebar;
