import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function ProblemChild({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Explosion in child component');
  }
  return <div>Safe child content</div>;
}

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe child content')).toBeDefined();
  });

  it('catches render error and displays default embedded ErrorView fallback', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /something went wrong/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /try again/i })).toBeDefined();
  });

  it('renders custom ReactNode fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Fallback UI</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Fallback UI')).toBeDefined();
  });

  it('renders custom fallback function and allows recovery via reset', () => {
    let throwError = true;
    function DynamicChild() {
      if (throwError) {
        throw new Error('Temporary glitch');
      }
      return <div>Recovered child</div>;
    }

    const { rerender } = render(
      <ErrorBoundary
        fallback={(err, reset) => (
          <div>
            <span>Error: {err.message}</span>
            <button onClick={reset}>Retry Action</button>
          </div>
        )}
      >
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error: Temporary glitch')).toBeDefined();

    throwError = false;
    fireEvent.click(screen.getByRole('button', { name: /retry action/i }));

    rerender(
      <ErrorBoundary
        fallback={(err, reset) => (
          <div>
            <span>Error: {err.message}</span>
            <button onClick={reset}>Retry Action</button>
          </div>
        )}
      >
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered child')).toBeDefined();
  });
});
