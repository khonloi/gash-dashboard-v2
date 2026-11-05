import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemoModeBanner } from './DemoModeBanner';
import * as apiClientModule from '@/lib/apiClient';
import * as mockHandlerModule from '@/demo/mockApiHandler';

describe('DemoModeBanner Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    });
  });

  it('renders trigger button indicating current demo state', () => {
    vi.spyOn(apiClientModule, 'isDemoModeActive').mockReturnValue(false);

    render(<DemoModeBanner />);

    const trigger = screen.getByRole('button', { name: /demo: off/i });
    expect(trigger).toBeDefined();
  });

  it('opens popup modal when trigger button is clicked', () => {
    vi.spyOn(apiClientModule, 'isDemoModeActive').mockReturnValue(true);

    render(<DemoModeBanner />);

    const trigger = screen.getByRole('button', { name: /demo: on/i });
    fireEvent.click(trigger);

    expect(screen.getByText('Offline Demo Mode')).toBeDefined();
    expect(screen.getByRole('switch', { name: /toggle demo mode/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /reset fixtures & state/i })).toBeDefined();
  });

  it('triggers setDemoMode and reloads window when toggle is switched', () => {
    vi.spyOn(apiClientModule, 'isDemoModeActive').mockReturnValue(false);
    const setDemoSpy = vi.spyOn(apiClientModule, 'setDemoMode').mockImplementation(() => {});

    render(<DemoModeBanner />);

    fireEvent.click(screen.getByRole('button', { name: /demo: off/i }));

    const toggle = screen.getByRole('switch', { name: /toggle demo mode/i });
    fireEvent.click(toggle);

    expect(setDemoSpy).toHaveBeenCalledWith(true);
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('triggers resetDemoState and reloads window on reset click', () => {
    const resetSpy = vi.spyOn(mockHandlerModule, 'resetDemoState').mockImplementation(() => {});

    render(<DemoModeBanner />);

    fireEvent.click(screen.getByRole('button', { name: /demo: off/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset fixtures & state/i }));

    expect(resetSpy).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
