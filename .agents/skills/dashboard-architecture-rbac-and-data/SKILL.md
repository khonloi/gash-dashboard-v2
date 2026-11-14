---
name: dashboard-architecture-rbac-and-data
description: >-
  Architecture guide for Next.js route groups, proxy-level RBAC enforcement, staff-only auth guards,
  React Query + Zustand state patterns, and demo-mode resolution in gash-dashboard. Use when editing
  src/proxy.ts, auth hooks, API client logic, or dashboard CRUD pages.
---

# Dashboard Architecture, RBAC & Data Layer (`gash-dashboard`)

Use this guide when updating authentication, route guards, data hooks, API configuration, or shared UI primitives in `d:\Project\gash-dashboard`.

## Core Modules

- Edge Proxy & RBAC: `src/proxy.ts`
- Auth & Data Hooks: `src/hooks/useAuth.ts`, `src/hooks/useOrders.ts`, `src/hooks/useProducts.ts`, `src/hooks/useUsers.ts`
- API Client: `src/lib/apiClient.ts`
- Stores: `src/store/useAuthStore.ts`, `src/store/useSupportChatStore.ts`, `src/store/useToastStore.ts`
- UI Library: `src/components/ui/` (`DataTable`, `StatCard`, `StatusBadge`, `Modal`, `Drawer`, `Select`, `Switch`, `Toast`, `Button`, `Input`, `Card`, `Skeleton`)

## Authentication & RBAC Rules

1. **Staff-Only Dashboard Access (`src/hooks/useAuth.ts`)**:
   - In `handleAuthSuccess`, strictly block `data.user.role === 'customer'` with `'Access denied. Customer accounts cannot access the GASH Operations Dashboard.'`.
2. **Route & Role Proxy (`src/proxy.ts`)**:
   - Public paths: `['/login', '/forgot-password', '/reset-password']`.
   - Protected routes redirect unauthenticated requests (no `COOKIE_KEYS.SESSION` and not demo mode) to `/login?callbackUrl=...`.
   - Admin-only prefixes (`['/orders', '/customers']`) block `role === 'seller'` by redirecting to `/?unauthorized=true`.

## API Client & Environment Rules (`src/lib/apiClient.ts`)

- `isDemoModeActive()` respects an explicit `NEXT_PUBLIC_DEMO_MODE=false` or `DEMO_MODE=false` in development (after `localStorage` check), rather than blindly overriding it with mock fixtures.
- In production (`NODE_ENV === 'production'`), client-side `localStorage` demo overrides are strictly disabled.
- Do not render `<DemoModeBanner />` in `src/app/layout.tsx` or `src/components/layout/Topbar/Topbar.tsx`.

## Data & State Pattern Split

- Server entity fetching & mutations (orders, products, users, auth session) use TanStack React Query (`@tanstack/react-query`) hooks in `src/hooks/`.
- Client-side UI, auth persistence (`STORAGE_KEYS.AUTH`), toasts, and live support chat streams live in Zustand (`src/store/`).
- Check `pnpm run typecheck && pnpm run lint && pnpm test -- --run` before wrapping up dashboard changes.

