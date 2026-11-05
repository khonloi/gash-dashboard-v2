/**
 * Global site and application constants for gash-dashboard.
 */

export const STORAGE_KEYS = {
  AUTH: 'gash-dashboard-auth-storage',
  DEMO_MODE: 'gash-dashboard-demo-mode',
} as const;

export const COOKIE_KEYS = {
  SESSION: 'gash_dashboard_session',
  ROLE: 'gash_dashboard_role',
  DEMO_MODE: 'gash_dashboard_demo_mode',
} as const;

export const SITE_CONFIG = {
  name: 'GASH Dashboard',
  brandName: 'GASH Dashboard',
  tagline: 'E-Commerce Operations & Management Dashboard',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  internalApiUrl: process.env.INTERNAL_API_URL || 'http://localhost:5000/api/v1',
  defaultPageSize: 20,
} as const;
