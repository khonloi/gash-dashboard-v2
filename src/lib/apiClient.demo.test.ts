import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { apiClient, isDemoModeActive, setDemoMode } from './apiClient';
import { FrontendProduct } from '@/types/product';
import { fetchProducts } from '@/services/productService';

describe('apiClient demo mode integration', () => {
  const originalEnv = process.env.NEXT_PUBLIC_DEMO_MODE;

  beforeEach(() => {
    setDemoMode(false);
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
  });

  afterEach(() => {
    setDemoMode(false);
    process.env.NEXT_PUBLIC_DEMO_MODE = originalEnv;
  });

  it('respects explicit demoMode flag in request options', async () => {
    const res = await apiClient.get<{ data: { products: unknown[] } }>('/products', {
      demoMode: true,
    });

    expect(res.data.products.length).toBeGreaterThan(0);
  });

  it('toggles demo mode via setDemoMode and persists in localStorage check', async () => {
    expect(isDemoModeActive()).toBe(false);

    setDemoMode(true);
    expect(isDemoModeActive()).toBe(true);

    // Call service layer seamlessly in demo mode
    const res = await apiClient.get<{ data: { products: unknown[] } }>('/products');
    expect(res.data.products.length).toBeGreaterThan(0);

    setDemoMode(false);
    expect(isDemoModeActive()).toBe(false);
  });

  it('allows productService to seamlessly fetch demo catalog when demo mode is active', async () => {
    setDemoMode(true);
    const products: FrontendProduct[] = await fetchProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].title).toBeDefined();
    expect(products[0].price).toBeGreaterThan(0);
  });

  it('strictly disallows localStorage demo mode override in production', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      localStorage.setItem('gash-dashboard-demo-mode', 'true');
      expect(isDemoModeActive()).toBe(false);

      setDemoMode(true);
      expect(isDemoModeActive()).toBe(false);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    }
  });
});
