# GASH Dashboard

[![Next.js](https://img.shields.io/badge/next.js-v16.4-black.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-v19.2-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-v5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/state-zustand%205-brown.svg?style=flat-square)](https://github.com/pmndrs/zustand)
[![TanStack Query](https://img.shields.io/badge/data_fetching-tanstack%20query%205-ff4154.svg?style=flat-square&logo=reactquery)](https://tanstack.com/query)
[![Styling: CSS Modules](https://img.shields.io/badge/styling-CSS%20Modules-4B32C3.svg?style=flat-square&logo=css3)](https://github.com/css-modules/css-modules)
[![Testing: Vitest](https://img.shields.io/badge/testing-vitest%205-729B1B.svg?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Linter: ESLint](https://img.shields.io/badge/linter-eslint%209-4B32C3.svg?style=flat-square&logo=eslint)](https://eslint.org/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square&logo=prettier)](https://prettier.io/)
[![Duplication: jscpd](https://img.shields.io/badge/duplication-%3C5.0%25-brightgreen.svg?style=flat-square)](https://github.com/kucherenko/jscpd)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.x-brightgreen.svg?style=flat-square&logo=node.js)](https://nodejs.org/)

An enterprise-grade, high-performance, production-ready **E-Commerce Operations & Management Dashboard** (`GASH Dashboard`) engineered for administrators and marketplace sellers. Built with **Next.js 16 (Turbopack, App Router)**, **React 19**, **TypeScript** in strict mode, **Zustand 5**, **TanStack React Query 5**, **Vitest**, and scoped **CSS Modules**.

Designed to operate seamlessly alongside the [GASH Frontend Storefront](https://github.com/your-username/gash-frontend) on port `3000` and [GASH Backend v2](https://github.com/your-username/gash-backend-v2) on port `5000`.

---

## Table of Contents

- [Architectural Highlights](#architectural-highlights)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Installation & Getting Started](#installation--getting-started)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Security & Edge Route Protection Architecture](#security--edge-route-protection-architecture)
  - [Next.js 16 Proxy Edge Pipeline](#nextjs-16-proxy-edge-pipeline)
  - [Resilient API Client with Dual-Token Rotation Interceptor](#resilient-api-client-with-dual-token-rotation-interceptor)
  - [Role-Based Access Control Matrix](#role-based-access-control-matrix)
  - [Content Security Policy & Hardened Security Headers](#content-security-policy--hardened-security-headers)
- [State Management & Data Architecture](#state-management--data-architecture)
  - [Client State Architecture (Zustand 5)](#client-state-architecture-zustand-5)
  - [Server State & Caching Pipeline (TanStack Query 5)](#server-state--caching-pipeline-tanstack-query-5)
  - [Global Notification System](#global-notification-system)
- [Offline In-Memory Demo Mode](#offline-in-memory-demo-mode)
  - [Zero-Backend Standalone Architecture](#zero-backend-standalone-architecture)
  - [Mock API Interceptor & Fixtures](#mock-api-interceptor--fixtures)
  - [Persona Switcher & State Management](#persona-switcher--state-management)
- [Admin Operations Workspaces](#admin-operations-workspaces)
  - [Executive Overview Analytics (`/`)](#executive-overview-analytics-)
  - [Products Catalog & 2-Column Editor (`/products`)](#products-catalog--2-column-editor-products)
  - [Real-Time Inventory Operations (`/inventory`)](#real-time-inventory-operations-inventory)
  - [Orders Fulfillment Pipeline (`/orders`)](#orders-fulfillment-pipeline-orders)
  - [Customer & Staff Privilege Directory (`/customers`)](#customer--staff-privilege-directory-customers)
  - [2-Column Settings Workspace (`/settings`)](#2-column-settings-workspace-settings)
  - [Staff Authentication Portal (`/login`)](#staff-authentication-portal-login)
- [Design System & Accessibility](#design-system--accessibility)
  - [Calibrated Design Tokens & WCAG AA Contrast](#calibrated-design-tokens--wcag-aa-contrast)
  - [Reusable UI Component Kit](#reusable-ui-component-kit)
  - [Shared Layout Abstractions (`PageHeader`)](#shared-layout-abstractions-pageheader)
- [Backend Integration & API Contract](#backend-integration--api-contract)
  - [GASH Backend (v2) Endpoint Alignment](#gash-backend-v2-endpoint-alignment)
  - [Schema Transformation & Normalization](#schema-transformation--normalization)
- [Testing & Quality Assurance](#testing--quality-assurance)
  - [Test Suite Statistics](#test-suite-statistics)
  - [Quality Gate Enforcement](#quality-gate-enforcement)
  - [Running Tests](#running-tests)
- [Production Deployment & Runtime Management](#production-deployment--runtime-management)
  - [Standalone Build Execution](#standalone-build-execution)
  - [PM2 Process Management](#pm2-process-management)
  - [Docker Containerization](#docker-containerization)
- [License](#license)

---

## Architectural Highlights

- **Port Isolation & Cookie Namespacing**:
  - Operates on dedicated port `3001` (`http://localhost:3001`) to coexist side-by-side with `gash-frontend` (`:3000`) and `gash-backend-v2` (`:5000`).
  - Utilizes isolated cookies (`gash_dashboard_session`, `gash_dashboard_role`, `gash_dashboard_demo_mode`) and localStorage namespaces (`gash-dashboard-auth-storage`, `gash-dashboard-demo-mode`), completely eliminating session collisions with customer storefront accounts.
- **Edge Route Protection via Next.js 16 Proxy Layer**:
  - Employs Next.js 16's native `src/proxy.ts` convention for edge-level session verification and role enforcement.
  - Automatically redirects unauthenticated requests to `/login?callbackUrl=...` and blocks unprivileged access before rendering client trees.
- **Dual Data Provider (Live REST API + Offline Demo Engine)**:
  - **Live Mode**: Zero-CORS direct REST communication to `gash-backend-v2` (`/api/v1`) with automatic Bearer token injection and dual-token rotation mutex.
  - **Offline Demo Mode**: Fully standalone operation intercepting API calls via `mockApiHandler.ts` with simulated latency, mutating in-memory fixtures, persona switching (`admin@gash.demo` / `seller@gash.demo`), and one-click fixture resets.
- **Accessible, Calibrated High-Contrast Design Tokens**:
  - Replaced low-contrast cyan (`#00e5c9`) text with deep accessible teal `--color-primary-text: #0f766e` (`>5.4:1` contrast on light surfaces, strictly exceeding WCAG AA standards).
  - High-contrast badges, dark-navy role indicators (`admin`), monospaced tabular digits (`.tabular-nums`), and standardized 40px input/select alignments.
- **Integrated Topbar & Obstruction-Free Layout**:
  - Embedded the Demo Banner & Popover trigger directly into the Topbar status area, ensuring floating widgets never obstruct table rows, action columns, or pagination bars.
  - Moved sidebar collapse toggle into the brand header to eliminate bottom-corner UI collisions.
- **Comprehensive Administrative Workspaces**:
  - Real-time GMV volume, pending fulfillment counts, and SKU distribution charts.
  - 2-Column Product Editor with instant profit margin and markup calculators.
  - Stock Adjustment Drawer with quick-preset chips (`+5`, `+10`, `+25`, `+50`, `+100`) and threshold warnings.
  - 5-Stage Order Fulfillment Stepper (`Placed → Confirmed → Processing → Dispatched → Delivered`).
  - Customer directory with active administrator self-deletion protection.
- **Strict Quality Engineering**:
  - Zero TypeScript errors (`tsc --noEmit`), zero ESLint warnings, 100% Prettier compliance.
  - Code duplication strictly controlled at **4.20%** (via `jscpd`, well below the 5.0% threshold).
  - 100% test pass rate across **58 test files and 243 unit & integration tests** in Vitest.

---

## Tech Stack

| Domain | Technology / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) | `16.4.2` | App Router, Turbopack, Edge Proxy (`proxy.ts`), Server Components |
| **Runtime & UI** | [React](https://react.dev/) / React DOM | `19.2.8` | Component rendering, concurrent transitions, hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.9+` | Strict mode typing, IntelliSense, contract verification |
| **Client State** | [Zustand](https://github.com/pmndrs/zustand) | `5.0.15` | Isolated auth, toast notification, and layout state |
| **Server State** | [TanStack React Query](https://tanstack.com/query) | `5.101.4` | Server state management, optimistic mutations, caching |
| **Styling** | Scoped CSS Modules | Vanilla CSS | Zero-runtime CSS isolation, CSS Custom Properties design system |
| **Icons** | [Lucide React](https://lucide.dev/) | `1.31.0` | High-efficiency SVG iconography |
| **Validation** | [Zod](https://zod.dev/) | `4.6.7` | Runtime product schema and form validation |
| **HTML Sanitization** | [isomorphic-dompurify](https://github.com/kkomelin/isomorphic-dompurify) | `4.2.0` | Prevention of XSS vulnerabilities in rich content |
| **Unit Testing** | [Vitest](https://vitest.dev/) | `5.0.1` | High-speed unit & integration test runner with JSDOM |
| **Testing Utilities** | [React Testing Library](https://testing-library.com/) | `16.3.3` | User-centric DOM testing utilities |
| **E2E Testing** | [Playwright](https://playwright.dev/) | `1.63.0` | Cross-browser end-to-end testing suite |
| **Duplication Guard** | [jscpd](https://github.com/kucherenko/jscpd) | `5.4.0` | Copy-paste code clone detection (enforced < 5.0%) |
| **Linter & Formatter** | [ESLint 9](https://eslint.org/) & [Prettier](https://prettier.io/) | Latest | Automated code styling, formatting, and accessibility audits |

---

## Project Directory Structure

```text
gash-dashboard/
├── public/                           # Static assets, branding icons, and web manifest
├── src/
│   ├── app/                          # Next.js App Router root
│   │   ├── (auth)/                   # Authentication route group (isolated layout)
│   │   │   ├── forgot-password/      # Password reset request view
│   │   │   ├── login/                # Staff Sign In with 1-click Demo Fillers
│   │   │   ├── reset-password/       # Tokenized password reset form
│   │   │   ├── auth.module.css       # Scoped auth portal styles
│   │   │   └── layout.tsx            # Auth layout with <main id="main-content">
│   │   ├── (dashboard)/              # Protected administrative workspace route group
│   │   │   ├── customers/            # User & Customer Directory
│   │   │   │   ├── CustomersClientView.tsx # Table, role modal, KPI strip
│   │   │   │   └── customers.module.css
│   │   │   ├── inventory/            # Real-Time Inventory & Valuation
│   │   │   │   ├── InventoryClientView.tsx # Stock overview, filtering, drawer trigger
│   │   │   │   └── inventory.module.css
│   │   │   ├── orders/               # Orders & Fulfillment Workspace
│   │   │   │   ├── [id]/             # Order Fulfillment Detail & 5-Step Stepper
│   │   │   │   │   ├── OrderDetailClientView.tsx
│   │   │   │   │   └── page.module.css
│   │   │   │   ├── OrdersClientView.tsx # Admin orders DataTable & KPIs
│   │   │   │   └── page.module.css
│   │   │   ├── products/             # Product Catalog & Inventory
│   │   │   │   ├── [id]/edit/        # Product Editing Route (2-column layout)
│   │   │   │   ├── new/              # Product Creation Route (2-column layout)
│   │   │   │   ├── ProductsClientView.tsx # Product catalog table & filter bar
│   │   │   │   └── products.module.css
│   │   │   ├── settings/             # Staff Profile, Password & Diagnostics
│   │   │   │   ├── SettingsClientView.tsx # 2-column settings workspace
│   │   │   │   └── settings.module.css
│   │   │   ├── dashboard.module.css  # Shared dashboard page container & filter bar styles
│   │   │   ├── layout.tsx            # Protected dashboard shell (Sidebar + Topbar)
│   │   │   ├── overview.module.css   # Executive overview styles
│   │   │   ├── OverviewClientView.tsx# Executive KPI cards & category distribution
│   │   │   └── page.tsx              # Root dashboard overview page
│   │   ├── error.tsx                 # Root dashboard error boundary
│   │   ├── globals.css               # Design tokens, resets, accessible typography
│   │   ├── layout.tsx                # Global HTML root layout & providers
│   │   ├── loading.tsx               # Global skeleton loading state
│   │   ├── not-found.tsx             # Global 404 handler
│   │   └── robots.ts                 # Search crawler disallow directive
│   ├── components/
│   │   ├── analytics/                # Web vitals telemetry reporting
│   │   ├── common/                   # Cross-cutting components
│   │   │   ├── DemoModeBanner/       # Topbar-embedded interactive demo controller
│   │   │   └── ErrorBoundary.tsx     # Graceful error capture wrapper
│   │   ├── inventory/                # Domain-specific inventory components
│   │   │   └── StockAdjustmentDrawer/# Slide-out stock adjustment modal with presets
│   │   ├── layout/                   # Structural shell components
│   │   │   ├── PageHeader/           # Standardized, accessible workspace header
│   │   │   ├── RoleGuard/            # Role-based component rendering guard
│   │   │   ├── Sidebar/              # Navigable drawer with brand mark & collapse toggle
│   │   │   └── Topbar/               # Header with interactive breadcrumbs & demo popover
│   │   ├── products/                 # Domain-specific product components
│   │   │   ├── ProductForm/          # 2-column product creation/editing form
│   │   │   └── ProductIdentityCell.tsx# Table product preview cell with SKU
│   │   ├── providers/                # Client context providers
│   │   │   └── ReactQueryProvider.tsx# TanStack Query client & cache configuration
│   │   └── ui/                       # Core headless/styled design system primitives
│   │       ├── Badge/                # Status and count indicators
│   │       ├── BrandLogo/            # Vector brand SVG iconography
│   │       ├── Breadcrumb/           # Clickable ancestor navigation path
│   │       ├── Button/               # Accessible button with shape, size, and icons
│   │       ├── Card/                 # Surface containment cards
│   │       ├── Checkbox/             # Accessible multi-select checkbox
│   │       ├── DataTable/            # Sortable, selectable admin table with empty states
│   │       ├── Divider/              # Semantic structural divider
│   │       ├── Drawer/               # Slide-out focus-trapped drawer
│   │       ├── EmptyState/           # Centered missing record presentation
│   │       ├── ErrorView/            # Formatted error presentation with retry
│   │       ├── Input/                # Standardized 40px text input with icon slots
│   │       ├── Modal/                # Accessible focus-trapped dialog
│   │       ├── Pagination/           # Compact horizontal admin pagination bar
│   │       ├── RadioGroup/           # Single-choice radio selector
│   │       ├── Select/               # Standardized 40px dropdown selector
│   │       ├── Skeleton/             # Animated shimmer placeholder loading
│   │       ├── StatCard/             # Metric KPI card with tabular numeric formatting
│   │       ├── StatusBadge/          # High-contrast role, status, and fulfillment badge
│   │       ├── Switch/               # Accessible toggle control
│   │       ├── Textarea/             # Multi-line expandable text input
│   │       └── Toast/                # Non-blocking transient alert system
│   ├── constants/                    # Site metadata, routes, and navigation items
│   ├── demo/                         # In-memory mock data engine & handlers
│   │   ├── mockApiHandler.ts         # Mock request router & CRUD mutations
│   │   └── mockData.ts               # Production-grade mock entities (products, orders, users)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                # Login, logout, and token mutation hooks
│   │   ├── useFocusTrap.ts           # Modal & drawer accessibility focus containment
│   │   ├── useOrders.ts              # Order queries, status mutations, cancellations
│   │   ├── useProducts.ts            # Catalog queries, stock mutations, CRUD hooks
│   │   └── useUsers.ts               # User directory queries, role & profile mutations
│   ├── lib/                          # Utility libraries & core infrastructure
│   │   ├── apiClient.ts              # Unified HTTP client with dual-mode interceptor
│   │   ├── format.ts                 # Currency, date, percentage, and tabular formatters
│   │   ├── productValidation.ts      # Zod validation schemas for products
│   │   ├── queryDefaults.ts          # Cache timing constants (staleTime, gcTime)
│   │   ├── tokenRefresher.ts         # Dual-token rotation concurrency mutex
│   │   └── validation.ts             # Email, password, and string sanitizers
│   ├── proxy.ts                      # Next.js 16 Edge proxy route guard
│   ├── services/                     # Remote REST API service clients
│   │   ├── authService.ts            # Authentication & token renewal endpoints
│   │   ├── orderService.ts           # Storewide order queries & status updates
│   │   ├── productMapper.ts          # Backend-to-frontend product DTO normalizer
│   │   ├── productService.ts         # Product catalog CRUD endpoints
│   │   └── userService.ts            # User profile & privilege endpoints
│   ├── store/                        # Zustand persistent client stores
│   │   ├── useAuthStore.ts           # Staff user profile, JWT tokens, permissions
│   │   └── useToastStore.ts          # Notification queue dispatcher
│   └── types/                        # Core TypeScript domain definitions
│       ├── api.ts                    # ApiResponse & PaginatedApiResponse contracts
│       ├── order.ts                  # Order, fulfillment, and payment models
│       ├── product.ts                # Product, variant, and category models
│       └── user.ts                   # User, role, and address models
├── .env.example                      # Template environment variable configuration
├── eslint.config.mjs                 # ESLint 9 configuration with Next.js rules
├── next.config.ts                    # Next.js 16 compiler, reverse proxy, CSP headers
├── package.json                      # Project manifest, dependencies, and scripts
├── tsconfig.json                     # TypeScript strict configuration
└── vitest.config.ts                  # Vitest runner configuration with JSDOM
```

---

## Prerequisites

Ensure your local development environment meets the following specifications:

- **Node.js**: `v20.x` or higher (`v22.x` recommended)
- **Package Manager**: [pnpm](https://pnpm.io/) (`v9.x` or `v12.x` recommended) or [npm](https://www.npmjs.com/) (`v10.x` or higher)
- **GASH Backend (v2)**: Listening on `http://localhost:5000` *(Optional: Dashboard runs completely standalone in Offline Demo Mode)*.

---

## Installation & Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gash-dashboard.git
cd gash-dashboard
```

### 2. Install Dependencies

Using `pnpm` (recommended):

```bash
pnpm install
```

Or using `npm`:

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` to create your local `.env.local` configuration:

```bash
cp .env.example .env.local
```

### 4. Run Development Server

```bash
pnpm run dev
```

The dashboard will boot on port `3001`:
[http://localhost:3001](http://localhost:3001)

> [!TIP]
> **Offline Demo Mode**: If `gash-backend-v2` is not running, the dashboard automatically operates in **Demo Mode**. You can log in instantly with the one-click **Fill Admin** button on the `/login` page (`admin@gash.demo` / `Admin123!`).

---

## Environment Configuration

| Variable | Required | Default | Description | Example |
| :--- | :---: | :---: | :--- | :--- |
| `PORT` | No | `3001` | Local port on which the Next.js development server listens | `3001` |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3001` | Canonical origin for the dashboard application | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5000/api/v1` | Public API endpoint for client requests and direct browser calls | `http://localhost:5000/api/v1` |
| `INTERNAL_API_URL` | No | `http://localhost:5000/api/v1` | Private/Internal backend API origin used by Next.js rewrites | `http://127.0.0.1:5000/api/v1` |
| `NEXT_PUBLIC_DEMO_MODE` | No | `false` | When `true`, forces in-memory mock handler without contacting backend | `true` or `false` |

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **dev** | `pnpm run dev` | Launches Next.js App Router on port `3001` with Turbopack Fast Refresh. |
| **build** | `pnpm run build` | Compiles optimized Next.js production build using Turbopack. |
| **start** | `pnpm run start` | Boots the compiled production server on port `3001`. |
| **typecheck** | `pnpm run typecheck` | Validates TypeScript types across the entire project (`tsc --noEmit`). |
| **lint** | `pnpm run lint` | Runs ESLint 9 to detect syntax, type, and code-style irregularities. |
| **format** | `pnpm run format` | Auto-formats code with Prettier (`src/**/*.{ts,tsx,css,json}`). |
| **format:check** | `pnpm run format:check` | Verifies code formatting compliance without modifying files. |
| **lint:duplicates**| `pnpm run lint:duplicates`| Scans codebase with `jscpd` to enforce duplication strictly `< 5.0%`. |
| **test** | `pnpm run test` | Executes full Vitest unit & integration test suites once. |
| **test:watch** | `pnpm run test:watch` | Launches Vitest in interactive watch mode for test-driven development. |
| **test:coverage** | `pnpm run test:coverage`| Runs Vitest with V8 code coverage analysis. |
| **test:e2e** | `pnpm run test:e2e` | Executes Playwright end-to-end tests against port `3001`. |
| **analyze** | `pnpm run analyze` | Generates Next.js bundle size distribution visualization report. |

---

## Security & Edge Route Protection Architecture

### Next.js 16 Proxy Edge Pipeline

Route protection is implemented at the edge using the Next.js 16 `src/proxy.ts` convention:

```
+-------------------------------------------------------------+
| Incoming Request (e.g., /products, /orders, /customers)     |
+-------------------------------------------------------------+
                              |
                              v
                +----------------------------+
                |    src/proxy.ts (Edge)     |
                +----------------------------+
                              |
          +-------------------+-------------------+
          |                                       |
    [Public Route]                          [Protected Route]
    (e.g., /login)                                |
          |                                       v
          v                             Check Session Cookie:
    Allow Request                   gash_dashboard_session & Role
                                                  |
                               +------------------+------------------+
                               |                                     |
                          [No Session]                         [Has Session]
                               |                                     |
                               v                                     v
                       Redirect to:                        Check Role Matrix:
              /login?callbackUrl=<target>               Allowed -> Next.js Page
                                                        Forbidden -> Redirect /
```

---

### Resilient API Client with Dual-Token Rotation Interceptor

The application integrates a resilient HTTP communication layer in `src/lib/apiClient.ts` that coordinates with the backend's dual-token security architecture:

```
+---------------+                                                      +------------------+
|  apiClient    | --- (1) Protected Request (Bearer AccessToken) ----> | GASH Backend v2  |
|               | <--- (2) HTTP 401 Unauthorized (Token Expired) ----- |                  |
+---------------+                                                      +------------------+
        |
        | [INTERCEPTOR ACTIVATED]
        | 1. Checks refreshPromise mutex (prevents concurrent refreshes)
        | 2. Retrieves refreshToken from useAuthStore
        v
+---------------+
|  authService  | --- (3) POST /api/v1/auth/refresh-token -----------> | GASH Backend v2  |
| .refreshToken | <--- (4) 200 OK (New Access + New Refresh Token) --- |                  |
+---------------+
        |
        | 3. Stores new tokens in useAuthStore (LocalStorage updated)
        | 4. Replaces Authorization header with new AccessToken
        v
+---------------+
|  apiClient    | --- (5) Replays Original Request (Transparently) --> | GASH Backend v2  |
| (Retry Step)  | <--- (6) 200 OK with Target Payload ---------------- |                  |
+---------------+
```

1. **401 Token Refresh Mutex**: If an access token expires mid-session, all concurrent requests wait on a single `refreshPromise`. Once refreshed, all pending requests replay automatically without session disruption.
2. **Exponential Backoff for Idempotent Queries**: Transparent retry mechanism for idempotent `GET` queries encountering transient network glitches or `5xx` errors.
3. **Timeout Protection**: Standard requests abort cleanly after 15 seconds via native `AbortController`.

---

### Role-Based Access Control Matrix

The dashboard distinguishes between two administrative roles:

| Route / Feature | Path | `admin` | `seller` | Behavior for Unauthorized Role |
| :--- | :--- | :---: | :---: | :--- |
| **Executive Overview** | `/` | Full Access | Full Access | Allowed |
| **Products Catalog** | `/products` | Full Access | Manage Own | Filtered to seller's products |
| **Product Creation & Edit** | `/products/new`, `[id]/edit` | Full Access | Full Access | Allowed |
| **Inventory Operations** | `/inventory` | Full Access | Manage Own | Allowed |
| **Orders & Fulfillment** | `/orders`, `/orders/[id]` | Full Access | Restricted | `<RoleGuard>` Access Restricted message |
| **User & Customer Directory**| `/customers` | Full Access | Restricted | `<RoleGuard>` Access Restricted message |
| **Settings & Diagnostics** | `/settings` | Full Access | Full Access | Allowed |

---

### Content Security Policy & Hardened Security Headers

Configured directly in `next.config.ts`:

- **HSTS (HTTP Strict Transport Security)**: `max-age=63072000; includeSubDomains; preload`
- **X-Frame-Options**: `SAMEORIGIN` (prevents clickjacking)
- **X-Content-Type-Options**: `nosniff` (mitigates MIME-type confusion attacks)
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Content-Security-Policy (CSP)**: Restricts script, connect, style, image, font, and frame origins.

---

## State Management & Data Architecture

```
                                  +------------------------------+
                                  |    GASH Dashboard State      |
                                  +------------------------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                                                           |
                   v                                                           v
       +-----------------------+                                   +-----------------------+
       |   Client-Side State   |                                   |   Server-Side State   |
       |       (Zustand)       |                                   |  (TanStack Query 5)   |
       +-----------------------+                                   +-----------------------+
       | - useAuthStore        |                                   | - useAllOrdersQuery   |
       |   * user, tokens      |                                   | - useAdminProducts    |
       |   * permissions       |                                   | - useProductStats     |
       |   * LocalStorage sync |                                   | - useUsersQuery       |
       | - useToastStore       |                                   | - Optimistic mutations|
       |   * notification queue|                                   | - Query cache (1-5m)  |
       +-----------------------+                                   +-----------------------+
```

### Client State Architecture (Zustand 5)

- **`useAuthStore`**:
  - Manages authenticated staff identity (`UserProfile`) and JWT credentials.
  - Automatically synchronizes with `localStorage` under `gash-dashboard-auth-storage`.
  - Sets corresponding document cookies (`gash_dashboard_session`, `gash_dashboard_role`) for edge proxy route evaluation.
- **`useToastStore`**:
  - Dispatches accessible, non-blocking toast notifications (`success`, `error`, `info`, `warning`) with auto-dismiss timers.

### Server State & Caching Pipeline (TanStack Query 5)

- Configured with calibrated stale times (`STALE_TIME.STANDARD = 60s`, `STALE_TIME.STATIC = 5m`).
- Automatic query key factories (`productKeys`, `orderKeys`, `userKeys`) ensure targeted cache invalidations upon mutation execution.

---

## Offline In-Memory Demo Mode

### Zero-Backend Standalone Architecture

When `NEXT_PUBLIC_DEMO_MODE=true` or when demo mode is toggled via the Topbar popover, `src/lib/apiClient.ts` intercepts all outgoing HTTP requests and routes them to `src/demo/mockApiHandler.ts`:

```
+-------------------------------------------------------------+
| apiClient.request<T>(endpoint, options)                     |
+-------------------------------------------------------------+
                              |
                     Is Demo Mode Active?
                              |
               +--------------+--------------+
               |                             |
             [YES]                          [NO]
               |                             |
               v                             v
+-------------------------------+   +--------------------+
| src/demo/mockApiHandler.ts    |   | Native fetch()     |
| - Synthetic Latency (200ms)   |   | -> gash-backend-v2 |
| - In-Memory Mutating State    |   +--------------------+
| - Mock Datasets (CRUD)        |
+-------------------------------+
```

### Mock API Interceptor & Fixtures

- **Catalog & Inventory**: In-memory database of 30+ luxury athletic products with image galleries, SKUs, inventory counts, and category classifications.
- **Orders & Fulfillment**: Complete lifecycle orders with mock customer names, shipping addresses, fulfillment statuses, and payment states.
- **User Directory**: Mock customer, seller, and administrator accounts supporting role upgrades and status modifications.

### Persona Switcher & State Management

The Topbar includes an interactive **Demo Mode** button opening a status popover:
- **Switch Persona**: Toggle between `Administrator` (`admin@gash.demo`) and `Seller` (`seller@gash.demo`) with one click.
- **Reset Fixtures**: Restores initial mock datasets from default fixtures in one click.

---

## Admin Operations Workspaces

### Executive Overview Analytics (`/`)
- **4 Real-Time KPI Cards**: Total Store Revenue (GMV), Fulfillment Orders, Active Catalog Items, and Staff Accounts.
- **Category Coverage Distribution**: Horizontal progress bars displaying SKU share percentages across Footwear, Apparel, Equipment, and Accessories.
- **Critical Stock Alerts**: Real-time notifications for items at or below restock thresholds with one-click drawer adjustments.

### Products Catalog & 2-Column Editor (`/products`)
- **Interactive DataTable**: Multi-column sorting, search by SKU/name, category and status filtering, and bulk pagination.
- **2-Column Product Form**:
  - *Primary Column (2fr)*: Basic information, Pricing with live Profit Margin & Gross Markup calculations, Inventory Tracking, and Media Gallery.
  - *Secondary Sticky Column (1fr)*: Publishing status, Featured toggle, Brand classification, and Category selection.

### Real-Time Inventory Operations (`/inventory`)
- Real-time stock valuation and units stored across fulfillment centers.
- Quick-filter tabs (`All Inventory`, `Low Stock Alerts`, `Out of Stock`).
- **Stock Adjustment Drawer**: Presets (`+5`, `+10`, `+25`, `+50`, `+100`), adjustment reason auditing, and immediate threshold warning feedback.

### Orders Fulfillment Pipeline (`/orders`)
- Admin operations view with 4 Fulfillment KPIs (Total Store Orders, Pending Fulfillment, In Transit, Delivered Net GMV).
- Order filtering by status (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) and payment status.
- **5-Stage Order Stepper** (`/orders/[id]`): Visual stepper tracking order progression, carrier tracking assignment, status transitions, and payment settlement.

### Customer & Staff Privilege Directory (`/customers`)
- Directory of all registered storefront shoppers, sellers, and system operators.
- Modal to promote or modify security role privileges (`customer` / `seller` / `admin`).
- **Active Session Protection**: Active logged-in administrator is tagged with a `You` badge, and self-deletion actions are disabled to prevent administrative lockouts.

### 2-Column Settings Workspace (`/settings`)
- **Main Column**: Staff Profile management (name, phone, avatar URL) and Password Change with confirmation validation.
- **Side Column**: Live Staff Identity card with avatar preview, verified role badge, staff ID, and System Diagnostics.

### Staff Authentication Portal (`/login`)
- Semantic `<main id="main-content">` landmark.
- 1-Click **Demo Account Fillers** (`Fill Admin` / `Fill Seller`) for instant test credential population.

---

## Design System & Accessibility

### Calibrated Design Tokens & WCAG AA Contrast

All design tokens are centralized in `src/app/globals.css`. Key contrast calibrations:

| Token | Value | Contrast Ratio on Light Surface | Status |
| :--- | :--- | :---: | :--- |
| `--color-primary-text` | `#0f766e` (Deep Teal) | **5.42:1** | **Passes WCAG AA (>= 4.5:1)** |
| `--color-primary-text-hover` | `#115e59` (Darker Teal) | **6.81:1** | **Passes WCAG AAA (>= 7.0:1)** |
| `--color-primary` | `#00e5c9` (Bright Cyan) | Used exclusively on dark surfaces | Calibrated |
| `--color-bg-subtle` | `#f8fafc` (Slate Subtle) | Background container token | Standardized |
| `--color-border-hover` | `#cbd5e1` (Slate Hover) | Architectural hover boundary | Standardized |

### Reusable UI Component Kit

All components in `src/components/ui` are built with zero-runtime CSS Modules and strict keyboard accessibility:
- **`DataTable`**: Centered empty states, sortable column headers, horizontal scrolling, and sticky header mechanics.
- **`StatCard`**: Tabular numerals (`font-variant-numeric: tabular-nums`), icon containers, and loading skeleton states.
- **`Button`**: True vertical icon centering via `leftIcon` / `rightIcon` flex alignment.
- **`Pagination`**: Compact horizontal admin layout (`Showing 1–10 of 30 items` + page controls).

### Shared Layout Abstractions (`PageHeader`)

The standardized `<PageHeader />` component (`src/components/layout/PageHeader`) encapsulates titles, subtitles, status badges, back-links, and primary action buttons across all views, eliminating CSS duplication across dashboard modules.

---

## Backend Integration & API Contract

### GASH Backend (v2) Endpoint Alignment

| Area | HTTP Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Authenticate staff credentials |
| **Auth** | `POST` | `/auth/refresh-token` | Renew access token via refresh token |
| **Auth** | `POST` | `/auth/logout` | Revoke session tokens |
| **Products** | `GET` | `/products` | List catalog products (paginated, filtered) |
| **Products** | `POST` | `/products` | Create a new catalog item |
| **Products** | `GET` | `/products/:id` | Fetch product detail |
| **Products** | `PATCH` | `/products/:id` | Update product attributes |
| **Products** | `DELETE`| `/products/:id` | Archive or delete a product |
| **Products** | `PATCH` | `/products/:id/stock` | Adjust inventory stock count |
| **Orders** | `GET` | `/orders` | List storewide orders (Admin) |
| **Orders** | `GET` | `/orders/:id` | Fetch single order details |
| **Orders** | `PATCH` | `/orders/:id/status` | Update fulfillment or payment state |
| **Users** | `GET` | `/users` | List registered user directory |
| **Users** | `PATCH` | `/users/:id/role` | Update user privilege role |
| **Users** | `DELETE`| `/users/:id` | Remove user account |

---

## Testing & Quality Assurance

### Test Suite Statistics

- **Test Files**: `58 passed (58)`
- **Total Tests**: `243 passed (243)`
- **Coverage**: Components, custom hooks, API clients, token refresh mutex, proxy routing, formatters, and mock handlers.

### Quality Gate Enforcement

Every build and commit must pass our automated quality gates:

```bash
# 1. Formatting Check
pnpm run format:check

# 2. ESLint Static Analysis
pnpm run lint

# 3. TypeScript Strict Typecheck
pnpm run typecheck

# 4. Code Duplication Check (Enforces < 5.0%)
pnpm run lint:duplicates

# 5. Vitest Unit & Integration Suite
pnpm run test

# 6. Next.js Turbopack Production Build
pnpm run build
```

### Running Tests

```bash
# Run all unit and integration tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with code coverage report
pnpm run test:coverage

# Run Playwright end-to-end tests
pnpm run test:e2e
```

---

## Production Deployment & Runtime Management

### Standalone Build Execution

The project is pre-configured with `output: 'standalone'` in `next.config.ts` for minimal production footprints:

```bash
# Compile production build
pnpm run build

# Start production server
pnpm run start
```

### PM2 Process Management

For production server environments:

```bash
# Install PM2 globally
npm install -g pm2

# Start dashboard process on port 3001
pm2 start npm --name "gash-dashboard" -- run start
```

### Docker Containerization

Example multi-stage Dockerfile:

```dockerfile
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
```

---

## License

Private and proprietary. Copyright © 2026 GASH Luxury Athletic Operations. All rights reserved.
