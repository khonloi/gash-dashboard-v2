import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_KEYS } from './constants/site';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];
const ADMIN_ONLY_PREFIXES = ['/orders', '/customers'];

/**
 * Next.js 16 Proxy convention for edge-level security, auth guards, and RBAC.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const hasSession = request.cookies.has(COOKIE_KEYS.SESSION);
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || request.cookies.has(COOKIE_KEYS.DEMO_MODE);

  // Authenticated user trying to access login/auth pages -> redirect to dashboard home
  if (isPublicPath) {
    if ((hasSession || isDemo) && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes require active session or demo mode
  if (!hasSession && !isDemo) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // RBAC enforcement for admin-only modules (/orders, /customers)
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isAdminOnly && !isDemo) {
    const role = request.cookies.get(COOKIE_KEYS.ROLE)?.value;
    if (role === 'seller') {
      const unauthorizedUrl = new URL('/', request.url);
      unauthorizedUrl.searchParams.set('unauthorized', 'true');
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api / _next/static / _next/image
     * - metadata icons & static assets (favicon.ico, icon.svg, apple-icon.png, robots.txt)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|robots.txt).*)',
  ],
};
