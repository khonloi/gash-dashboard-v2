import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';
import { COOKIE_KEYS } from './constants/site';

describe('Next.js Proxy route protection and RBAC', () => {
  const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
  });

  it('allows unauthenticated access to public auth paths', () => {
    const loginReq = new NextRequest('http://localhost:3001/login');
    expect(proxy(loginReq).status).toBe(200);

    const forgotReq = new NextRequest('http://localhost:3001/forgot-password');
    expect(proxy(forgotReq).status).toBe(200);

    const resetReq = new NextRequest('http://localhost:3001/reset-password/sample-token');
    expect(proxy(resetReq).status).toBe(200);
  });

  it('redirects unauthenticated requests targeting protected routes to /login', () => {
    const homeReq = new NextRequest('http://localhost:3001/');
    const homeRes = proxy(homeReq);
    expect(homeRes.status).toBe(307);
    expect(homeRes.headers.get('location')).toBe('http://localhost:3001/login');

    const productsReq = new NextRequest('http://localhost:3001/products');
    const productsRes = proxy(productsReq);
    expect(productsRes.status).toBe(307);
    expect(productsRes.headers.get('location')).toBe(
      'http://localhost:3001/login?callbackUrl=%2Fproducts'
    );
  });

  it('allows access to protected routes when dashboard session is active', () => {
    const request = new NextRequest('http://localhost:3001/products', {
      headers: {
        cookie: `${COOKIE_KEYS.SESSION}=1; ${COOKIE_KEYS.ROLE}=seller`,
      },
    });
    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects seller attempting to access admin-only /orders to /?unauthorized=true', () => {
    const request = new NextRequest('http://localhost:3001/orders', {
      headers: {
        cookie: `${COOKIE_KEYS.SESSION}=1; ${COOKIE_KEYS.ROLE}=seller`,
      },
    });
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/?unauthorized=true');
  });

  it('redirects seller attempting to access admin-only /customers to /?unauthorized=true', () => {
    const request = new NextRequest('http://localhost:3001/customers/123', {
      headers: {
        cookie: `${COOKIE_KEYS.SESSION}=1; ${COOKIE_KEYS.ROLE}=seller`,
      },
    });
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/?unauthorized=true');
  });

  it('allows admin role to access /orders and /customers', () => {
    const ordersReq = new NextRequest('http://localhost:3001/orders', {
      headers: {
        cookie: `${COOKIE_KEYS.SESSION}=1; ${COOKIE_KEYS.ROLE}=admin`,
      },
    });
    expect(proxy(ordersReq).status).toBe(200);

    const customersReq = new NextRequest('http://localhost:3001/customers', {
      headers: {
        cookie: `${COOKIE_KEYS.SESSION}=1; ${COOKIE_KEYS.ROLE}=admin`,
      },
    });
    expect(proxy(customersReq).status).toBe(200);
  });

  it('redirects authenticated user visiting /login back to dashboard root /', () => {
    const request = new NextRequest('http://localhost:3001/login', {
      headers: {
        cookie: `${COOKIE_KEYS.SESSION}=1`,
      },
    });
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/');
  });

  it('allows access in demo mode', () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    const request = new NextRequest('http://localhost:3001/orders');
    expect(proxy(request).status).toBe(200);
  });
});
