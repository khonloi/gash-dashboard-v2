import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders label and count', () => {
    render(<Checkbox checked={false} onChange={vi.fn()} label="Nike" count={12} />);

    expect(screen.getByText('Nike')).toBeDefined();
    expect(screen.getByText('(12)')).toBeDefined();
  });

  it('triggers onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} onChange={handleChange} label="Accept Terms" />);

    const input = screen.getByRole('checkbox');
    fireEvent.click(input);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('sets aria-checked to mixed when indeterminate is true', () => {
    render(<Checkbox checked={false} indeterminate={true} onChange={vi.fn()} label="Select All" />);

    const input = screen.getByRole('checkbox');
    expect(input.getAttribute('aria-checked')).toBe('mixed');
  });

  it('sets aria-invalid when hasError is true', () => {
    render(
      <Checkbox checked={false} hasError={true} onChange={vi.fn()} label="Required consent" />
    );

    const input = screen.getByRole('checkbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('disables input when disabled is true', () => {
    render(<Checkbox checked={false} disabled={true} onChange={vi.fn()} label="Out of Stock" />);

    const input = screen.getByRole('checkbox');
    expect(input.hasAttribute('disabled')).toBe(true);
  });
});
