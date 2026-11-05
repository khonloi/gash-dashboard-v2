'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { isDemoModeActive, setDemoMode } from '@/lib/apiClient';
import { resetDemoState } from '@/demo/mockApiHandler';
import { mockUser, mockSellerUser, mockTokens } from '@/demo/mockData';
import { useAuthStore } from '@/store/useAuthStore';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Sparkles, X, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import styles from './DemoModeBanner.module.css';

const subscribeToStorage = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

export interface DemoModeBannerProps {
  inline?: boolean;
  hideOnDashboard?: boolean;
}

export function DemoModeBanner({
  inline = false,
  hideOnDashboard = false,
}: DemoModeBannerProps = {}) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const isActive = useSyncExternalStore(
    subscribeToStorage,
    () => isDemoModeActive(),
    () => false
  );
  const [isOpen, setIsOpen] = useState(false);
  const currentUserRole = useAuthStore((state) => state.user?.role);
  const setAuth = useAuthStore((state) => state.setAuth);

  if (!isMounted) {
    return null;
  }

  // If hideOnDashboard is true and we're not on auth routes, suppress floating banner
  const isDashboardRoute =
    pathname &&
    !['/login', '/forgot-password', '/reset-password'].some((p) => pathname.startsWith(p));
  if (hideOnDashboard && isDashboardRoute) {
    return null;
  }

  const handleToggle = () => {
    const nextState = !isActive;
    setDemoMode(nextState);
    window.location.reload();
  };

  const handleResetData = () => {
    resetDemoState();
    window.location.reload();
  };

  const handleSwitchPersona = (role: 'admin' | 'seller') => {
    const targetUser = role === 'seller' ? mockSellerUser : mockUser;
    setAuth(targetUser, mockTokens);
    window.location.reload();
  };

  const panelContent = (
    <>
      <div className={styles.header}>
        <div className={styles.title}>
          <Sparkles size={16} />
          <span>Offline Demo Mode</span>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => setIsOpen(false)}
          aria-label="Close demo settings"
        >
          <X size={16} />
        </button>
      </div>

      <p className={styles.description}>
        When Demo Mode is enabled, catalog queries, stock adjustments, and order updates are
        simulated locally with stateful mock services.
      </p>

      <div className={styles.actionRow}>
        <span className={styles.toggleLabel}>Active Status</span>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          className={`${styles.toggleSwitch} ${isActive ? styles.toggleSwitchActive : ''}`}
          onClick={handleToggle}
          aria-label="Toggle Demo Mode"
        >
          <span className={`${styles.toggleSlider} ${isActive ? styles.toggleSliderActive : ''}`} />
        </button>
      </div>

      <button
        type="button"
        className={styles.resetButton}
        onClick={handleResetData}
        title="Reset in-memory cart, user, and orders to initial fixtures"
      >
        <RotateCcw size={12} style={{ display: 'inline', marginRight: '6px' }} />
        Reset Fixtures & State
      </button>

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Demo Persona Switcher
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={styles.resetButton}
            style={{
              flex: 1,
              backgroundColor:
                currentUserRole === 'admin' ? 'var(--color-primary-subtle)' : undefined,
              color: currentUserRole === 'admin' ? 'var(--color-primary-text)' : undefined,
              fontWeight: currentUserRole === 'admin' ? 600 : 400,
            }}
            onClick={() => handleSwitchPersona('admin')}
          >
            Admin
          </button>
          <button
            type="button"
            className={styles.resetButton}
            style={{
              flex: 1,
              backgroundColor:
                currentUserRole === 'seller' ? 'var(--color-primary-subtle)' : undefined,
              color: currentUserRole === 'seller' ? 'var(--color-primary-text)' : undefined,
              fontWeight: currentUserRole === 'seller' ? 600 : 400,
            }}
            onClick={() => handleSwitchPersona('seller')}
          >
            Seller
          </button>
        </div>
      </div>
    </>
  );

  if (inline) {
    return (
      <div className={styles.inlineContainer} aria-label="Demo Mode Control Panel">
        <button
          type="button"
          className={clsx(styles.inlineTrigger, isActive && styles.inlineTriggerDemo)}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="demo-panel-overlay"
          title="Toggle interactive demo mode controls"
        >
          <span
            className={clsx(styles.statusDot, isActive && styles.statusDotActive)}
            aria-hidden="true"
          />
          <Sparkles size={13} aria-hidden="true" />
          <span>Demo: {isActive ? 'ON' : 'OFF'}</span>
        </button>

        {isOpen && (
          <div id="demo-panel-overlay" className={styles.inlineModal} role="region">
            {panelContent}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className={styles.container} aria-label="Demo Mode Control Panel">
      <button
        type="button"
        className={styles.triggerButton}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="demo-panel-overlay"
      >
        <span
          className={`${styles.statusDot} ${isActive ? styles.statusDotActive : ''}`}
          aria-hidden="true"
        />
        <Sparkles size={14} aria-hidden="true" />
        <span>Demo: {isActive ? 'ON' : 'OFF'}</span>
      </button>

      {isOpen && (
        <div id="demo-panel-overlay" className={styles.modalOverlay} role="region">
          {panelContent}
        </div>
      )}
    </aside>
  );
}
