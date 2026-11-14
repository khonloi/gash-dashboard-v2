---
name: quality-verification
description: >-
  Project-specific testing, linting, static type checking, duplicate code checking, and quality
  verification workflow for gash-dashboard. Use this skill whenever running tests, linting with ESLint,
  checking types with TypeScript, editing dashboard views or Support Desk UI, or verifying changes
  before completion in gash-dashboard.
---

# GASH Operations Dashboard: Testing, Linting & Quality Verification

Use this workflow to verify code changes, author tests, and enforce dashboard quality gates in `d:\Project\gash-dashboard`.

## Environment & Tooling

Run verification commands with `pnpm` from `d:\Project\gash-dashboard`:

```powershell
# 1. Type-check
pnpm run typecheck

# 2. Lint with ESLint
pnpm run lint

# 3. Duplicate code check
pnpm run lint:duplicates

# 4. Run full Vitest unit & component suite
pnpm test -- --run

# 5. Run Playwright E2E suite
pnpm run test:e2e
```

## Targeted Test Execution

| Subsystem | Test File(s) | Command |
| :--- | :--- | :--- |
| API Client & Demo Mode | `src/lib/apiClient.test.ts`, `src/lib/apiClient.demo.test.ts` | `pnpm test -- --run src/lib/apiClient` |
| Auth & Access Control | `src/services/authService.test.ts`, `src/hooks/useAuth.test.tsx`, `src/store/useAuthStore.test.ts` | `pnpm test -- --run src/services/authService src/hooks/useAuth src/store/useAuthStore` |
| Support Desk & Real-Time Chat | `src/app/(dashboard)/support/SupportClientView.test.tsx` | `pnpm test -- --run src/app/(dashboard)/support/SupportClientView.test.tsx` |
| Dashboard UI Components | `src/components/ui/**/*.test.tsx` | `pnpm test -- --run src/components/ui` |

## Architectural & Quality Invariants

1. **Explicit Demo Mode Respect (`src/lib/apiClient.ts`)**:
   - `isDemoModeActive()` must always honor an explicit `NEXT_PUBLIC_DEMO_MODE=false` setting rather than defaulting to demo fixtures in development.
   - Do not render `<DemoModeBanner />` in `src/app/layout.tsx` or `src/components/layout/Topbar/Topbar.tsx`.
2. **Support Desk Layout & Lifecycle (`src/app/(dashboard)/support/SupportClientView.tsx`, `src/store/useSupportChatStore.ts`)**:
   - Render the Support Desk full-bleed (`calc(100vh - 64px)`) without outer title/header chrome.
   - Immediately remove closed conversations (`status === 'closed'`) from `conversations` and exclude them from all tabs (`Queued`, `Assigned`, `All`, `Resolved`).
   - Disable the staff reply input and Claim Ticket button unless `activeConversation.status` is `'queued'` or `'assigned'`.
   - Customer accounts (`role === 'customer'`) must always be rejected during dashboard authentication (`useAuth.ts`).
3. **Git Hook Tooling**:
   - `.husky/pre-commit` must invoke `pnpm exec lint-staged` (not `npx lint-staged`).
4. **Offline Determinism**:
   - Vitest unit and component tests must mock API and Socket.IO clients and run without live backend dependencies.

## Pre-Completion Verification Checklist

Before declaring any change complete in `gash-dashboard`:
1. `pnpm run typecheck` passes with zero TypeScript errors.
2. `pnpm run lint` passes with zero ESLint errors.
3. `pnpm test -- --run` passes 100% of test files and test cases.

