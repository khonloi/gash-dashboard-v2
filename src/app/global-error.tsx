'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary to catch failures thrown inside the root layout.
 * Next.js App Router requires global-error to define its own <html> and <body>.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global application layout error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f8fafc',
          color: '#0c1c30',
        }}
      >
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#ffffff',
              padding: '36px 28px',
              borderRadius: '16px',
              boxShadow: '0 10px 25px rgba(12, 28, 48, 0.1)',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 51, 102, 0.12)',
                color: '#ff3366',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                fontSize: '28px',
              }}
            >
              ⚠
            </div>
            <h1
              style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px', color: '#0c1c30' }}
            >
              Application Encountered an Error
            </h1>
            <p
              style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 20px' }}
            >
              A critical failure interrupted the application shell. Please reload the page to
              restore session connectivity.
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  margin: '0 0 20px',
                  fontFamily: 'monospace',
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  backgroundColor: '#00e5c9',
                  color: '#0c1c30',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
