'use client';

import React, { useState } from 'react';
import { Sidebar, Topbar } from '@/components/layout';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.dashboardShell}>
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      <div className={styles.mainWrapper}>
        <Topbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        <main id="main-content" className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
