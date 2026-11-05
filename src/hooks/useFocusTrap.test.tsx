import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap';

function TestModal({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);

  return (
    <div>
      <button data-testid="outside-trigger">Trigger</button>
      {isOpen && (
        <div ref={containerRef} data-testid="trap-container" tabIndex={-1}>
          <button data-testid="first-button">First</button>
          <button data-testid="second-button">Second</button>
        </div>
      )}
    </div>
  );
}

describe('useFocusTrap', () => {
  const originalOffsetParent = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetParent'
  );

  beforeEach(() => {
    // jsdom does not implement offsetParent; mock it so visible elements are detected
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      get() {
        return this.parentNode;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    if (originalOffsetParent) {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
    }
    vi.restoreAllMocks();
  });

  it('does nothing when isOpen is false', () => {
    const onClose = vi.fn();
    render(<TestModal isOpen={false} onClose={onClose} />);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    document.dispatchEvent(escapeEvent);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByTestId('trap-container')).toBeNull();
  });

  it('calls onClose when Escape key is pressed and isOpen is true', () => {
    const onClose = vi.fn();
    render(<TestModal isOpen={true} onClose={onClose} />);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(escapeEvent);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus forward with Tab from last element to first element', () => {
    render(<TestModal isOpen={true} />);

    const first = screen.getByTestId('first-button');
    const second = screen.getByTestId('second-button');

    second.focus();
    expect(document.activeElement).toBe(second);

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
      shiftKey: false,
    });
    document.dispatchEvent(tabEvent);

    expect(document.activeElement).toBe(first);
  });

  it('traps focus backward with Shift+Tab from first element to last element', () => {
    render(<TestModal isOpen={true} />);

    const first = screen.getByTestId('first-button');
    const second = screen.getByTestId('second-button');

    first.focus();
    expect(document.activeElement).toBe(first);

    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
      shiftKey: true,
    });
    document.dispatchEvent(shiftTabEvent);

    expect(document.activeElement).toBe(second);
  });

  it('restores focus to trigger when closing modal', () => {
    function ToggleModal() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button data-testid="toggle-btn" onClick={() => setIsOpen((prev) => !prev)}>
            Toggle
          </button>
          <TestModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      );
    }

    render(<ToggleModal />);

    const toggleBtn = screen.getByTestId('toggle-btn');
    toggleBtn.focus();
    expect(document.activeElement).toBe(toggleBtn);

    // Open modal
    act(() => {
      toggleBtn.click();
    });

    const first = screen.getByTestId('first-button');
    first.focus();
    expect(document.activeElement).toBe(first);

    // Close modal via Escape
    act(() => {
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(escapeEvent);
    });

    // Previous active element before trap was toggleBtn
    expect(document.activeElement).toBe(toggleBtn);
  });
});
