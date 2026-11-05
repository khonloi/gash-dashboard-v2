import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Drawer } from './Drawer';

describe('Drawer Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Adjust Stock">
        Drawer Content
      </Drawer>
    );

    expect(screen.queryByText('Adjust Stock')).toBeNull();
  });

  it('renders title and content when isOpen is true and triggers onClose', () => {
    const handleClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={handleClose} title="Adjust Stock">
        Drawer Content
      </Drawer>
    );

    expect(screen.getByText('Adjust Stock')).toBeDefined();
    expect(screen.getByText('Drawer Content')).toBeDefined();

    const closeBtn = screen.getByRole('button', { name: /close drawer/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
