---
name: support-desk-and-realtime-ops
description: >-
  Implementation rules, real-time Socket.IO synchronization, layout structure, and moderation rules
  for the Support Desk in gash-dashboard. Use when modifying SupportClientView, Support.module.css,
  useSupportChatStore, dashboard chatService, or support socket handling.
---

# Live Support Desk & Real-Time Ops (`gash-dashboard`)

Use this runbook when working on the staff/admin real-time customer support desk in `d:\Project\gash-dashboard`.

## Core Modules

- UI & Styling: `src/app/(dashboard)/support/SupportClientView.tsx`, `src/app/(dashboard)/support/Support.module.css`
- Store: `src/store/useSupportChatStore.ts`
- Services & Socket: `src/services/chatService.ts`, `src/lib/socketClient.ts`
- Status Badge Component: `src/components/ui/StatusBadge/StatusBadge.tsx`

## UI Layout & Styling Constraints

1. **Full-Bleed Workspace**:
   - `.supportContainer` in `Support.module.css` uses `height: calc(100vh - var(--header-height, 64px))` with negative margin cancelling outer shell padding (`margin: calc(-1 * var(--space-6))` on desktop, `calc(-1 * var(--space-4))` under `768px`).
   - Do not re-add an outer page header/title block above the split-pane support queue and chat viewport.
2. **Design System Components**:
   - Reuse `@/components/ui` (`Button`, `Input`, `Badge`, `StatusBadge`, `EmptyState`) instead of custom unstyled elements.
   - `StatusBadge` maps chat statuses cleanly: `bot_active` (`purple`), `queued` (`amber`), `assigned` (`blue`), `resolved` (`emerald`), `closed` (`gray`).

## State, Queue Tabs & Real-Time Invariants

1. **Tab Filtering (`SupportFilterTab`)**:
   - Supported tabs: `'queued'`, `'assigned'`, `'all'`, `'resolved'`.
   - Closed conversations (`status === 'closed'`) must always be filtered out client-side and immediately removed from `conversations` and `activeConversation` so they never appear in any tab including `All`.
2. **Staff Interaction Gate**:
   - Compute `canStaffInteract = activeConversation?.status === 'queued' || activeConversation?.status === 'assigned'`.
   - Disable the reply input, Send button, and Claim Ticket controls when `!canStaffInteract` (e.g., while `bot_active` before customer escalates to human support).
3. **Person Hydration Guard**:
   - Preserve populated `user` and `assignedAgent` objects with `isPopulatedPerson` / `mergeConversation` in `useSupportChatStore.ts` so customer/agent names never regress to `"undefined undefined"` when incremental Socket.IO payloads arrive.
4. **Socket.IO (`src/lib/socketClient.ts`)**:
   - `getSupportSocket(token)` connects with `transports: ['polling', 'websocket']`, infinite reconnection, and token refresh on `reconnect_attempt`.
   - `SupportClientView` runs a 3s background `syncActiveState()` safety poll while active (skipped when `NODE_ENV === 'test'`).

## Verification

Run `pnpm test -- --run src/app/(dashboard)/support/SupportClientView.test.tsx` and `pnpm run typecheck && pnpm run lint`.

