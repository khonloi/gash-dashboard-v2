import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Switch } from './Switch';

describe('Switch Component', () => {
  it('renders label and handles click toggle', () => {
    const handleChange = vi.fn();
    render(
      <Switch
        checked={false}
        onChange={handleChange}
        label="Active Product"
        description="Visible in public catalog"
      />
    );

    expect(screen.getByText('Active Product')).toBeDefined();
    expect(screen.getByText('Visible in public catalog')).toBeDefined();

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(switchBtn);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const handleChange = vi.fn();
    render(<Switch checked={true} onChange={handleChange} disabled label="Disabled Switch" />);

    const switchBtn = screen.getByRole('switch');
    fireEvent.click(switchBtn);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
