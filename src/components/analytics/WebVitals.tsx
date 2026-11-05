'use client';

import { useReportWebVitals } from 'next/web-vitals';

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

export const handleWebVitals: ReportWebVitalsCallback = (metric) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Web-Vital] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType,
    });
  }

  // Forward to Google Analytics / gtag if configured in browser environment
  if (typeof window !== 'undefined') {
    const win = window as Window & {
      gtag?: (
        command: string,
        eventName: string,
        params: {
          value: number;
          event_label: string;
          non_interaction: boolean;
        }
      ) => void;
    };

    if (typeof win.gtag === 'function') {
      win.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
};

/**
 * WebVitals client component that captures Core Web Vitals (CLS, FID, FCP, LCP, INP, TTFB)
 * and relays them to development console or external telemetry.
 */
export function WebVitals() {
  useReportWebVitals(handleWebVitals);
  return null;
}
