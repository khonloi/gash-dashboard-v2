import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleWebVitals, WebVitals } from './WebVitals';
import * as webVitalsModule from 'next/web-vitals';

vi.mock('next/web-vitals', () => ({
  useReportWebVitals: vi.fn(),
}));

describe('WebVitals Component & Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers useReportWebVitals on render', () => {
    render(<WebVitals />);
    expect(webVitalsModule.useReportWebVitals).toHaveBeenCalledWith(handleWebVitals);
  });

  it('forwards metric to window.gtag if present', () => {
    const mockGtag = vi.fn();
    (window as unknown as { gtag: typeof mockGtag }).gtag = mockGtag;

    handleWebVitals({
      id: 'metric-1',
      name: 'LCP',
      value: 1200.4,
      rating: 'good',
      delta: 1200.4,
      entries: [],
      navigationType: 'navigate',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'LCP', {
      value: 1200,
      event_label: 'metric-1',
      non_interaction: true,
    });

    delete (window as unknown as { gtag?: typeof mockGtag }).gtag;
  });

  it('multiplies CLS score by 1000 for gtag integer format', () => {
    const mockGtag = vi.fn();
    (window as unknown as { gtag: typeof mockGtag }).gtag = mockGtag;

    handleWebVitals({
      id: 'metric-cls',
      name: 'CLS',
      value: 0.05,
      rating: 'good',
      delta: 0.05,
      entries: [],
      navigationType: 'navigate',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'CLS', {
      value: 50,
      event_label: 'metric-cls',
      non_interaction: true,
    });

    delete (window as unknown as { gtag?: typeof mockGtag }).gtag;
  });
});
