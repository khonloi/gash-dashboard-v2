import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('renders input field with placeholder', () => {
    render(<Input placeholder="Enter username" />);
    expect(screen.getByPlaceholderText('Enter username')).toBeDefined();
  });

  it('handles value changes via onChange', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'hello' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders label linked to input id', () => {
    render(<Input id="email-field" label="Email Address" />);

    const label = screen.getByText('Email Address');
    expect(label.getAttribute('for')).toBe('email-field');

    const input = screen.getByLabelText('Email Address');
    expect(input.getAttribute('id')).toBe('email-field');
  });

  it('displays error text and sets aria-invalid and role="alert"', () => {
    render(<Input id="password-field" label="Password" errorText="Password is required" />);

    const input = screen.getByLabelText('Password');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('password-field-error');

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Password is required');
  });

  it('displays helper text and links aria-describedby', () => {
    render(
      <Input id="username-field" label="Username" helperText="Must be at least 3 characters" />
    );

    const input = screen.getByLabelText('Username');
    expect(input.getAttribute('aria-describedby')).toBe('username-field-helper');
    expect(screen.getByText('Must be at least 3 characters')).toBeDefined();
  });

  it('renders left and right icons', () => {
    render(
      <Input
        leftIcon={<span data-testid="search-icon">🔍</span>}
        rightIcon={<span data-testid="clear-icon">✖</span>}
      />
    );

    expect(screen.getByTestId('search-icon')).toBeDefined();
    expect(screen.getByTestId('clear-icon')).toBeDefined();
  });
});
