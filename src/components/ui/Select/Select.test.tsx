import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Select } from './Select';

describe('Select Component', () => {
  it('renders label and options', () => {
    const options = [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
    ];

    render(<Select label="Status" id="status" options={options} />);

    expect(screen.getByLabelText('Status')).toBeDefined();
    expect(screen.getByText('All Statuses')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('triggers onChange when value changes', () => {
    const handleChange = vi.fn();
    const options = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];

    render(<Select options={options} onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'banana' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when errorText is passed', () => {
    render(<Select errorText="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeDefined();
  });
});
