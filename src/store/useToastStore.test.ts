import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToastStore } from './useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds toast with default info type and generates unique ID', () => {
    useToastStore.getState().addToast('Welcome athlete!');

    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Welcome athlete!');
    expect(toasts[0].type).toBe('info');
    expect(typeof toasts[0].id).toBe('string');
    expect(toasts[0].id.length).toBeGreaterThan(0);
  });

  it('adds toast with custom type (success, error)', () => {
    useToastStore.getState().addToast('Payment complete', 'success');
    useToastStore.getState().addToast('Payment failed', 'error');

    const { toasts } = useToastStore.getState();
    expect(toasts.length).toBe(2);
    expect(toasts[0].type).toBe('success');
    expect(toasts[1].type).toBe('error');
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('removes toast by ID', () => {
    useToastStore.getState().addToast('Item added', 'success');
    const toastId = useToastStore.getState().toasts[0].id;

    useToastStore.getState().removeToast(toastId);
    expect(useToastStore.getState().toasts.length).toBe(0);
  });

  it('auto-removes toast after 3000ms timeout', () => {
    useToastStore.getState().addToast('Temporary notification');
    expect(useToastStore.getState().toasts.length).toBe(1);

    vi.advanceTimersByTime(3000);
    expect(useToastStore.getState().toasts.length).toBe(0);
  });
});
