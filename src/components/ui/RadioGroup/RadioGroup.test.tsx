import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup', () => {
  const options = [
    { value: 'standard', title: 'Standard Shipping', description: '3-5 business days' },
    { value: 'express', title: 'Express Shipping', description: '1-2 business days' },
    { value: 'overnight', title: 'Overnight', disabled: true },
  ];

  it('renders all radio options', () => {
    render(<RadioGroup name="shipping" value="standard" onChange={vi.fn()} options={options} />);

    expect(screen.getByText('Standard Shipping')).toBeDefined();
    expect(screen.getByText('3-5 business days')).toBeDefined();
    expect(screen.getByText('Express Shipping')).toBeDefined();
  });

  it('handles change when an option is selected', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup name="shipping" value="standard" onChange={handleChange} options={options} />
    );

    const expressRadio = screen.getByRole('radio', { name: /Express Shipping/i });
    fireEvent.click(expressRadio);

    expect(handleChange).toHaveBeenCalledWith('express');
  });

  it('renders group label and error message', () => {
    render(
      <RadioGroup
        name="shipping"
        value=""
        onChange={vi.fn()}
        options={options}
        label="Shipping Method"
        error="Please select a shipping method"
      />
    );

    expect(screen.getByText('Shipping Method')).toBeDefined();
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Please select a shipping method');
  });

  it('disables disabled option', () => {
    render(<RadioGroup name="shipping" value="standard" onChange={vi.fn()} options={options} />);

    const overnightRadio = screen.getByRole('radio', { name: /Overnight/i });
    expect(overnightRadio.hasAttribute('disabled')).toBe(true);
  });
});
