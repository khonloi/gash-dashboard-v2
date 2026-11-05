import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatCurrency,
  formatDate,
  formatDateTime,
  getOrderStatusVariant,
} from './format';

describe('formatPrice and formatCurrency', () => {
  it('formats positive numbers as USD', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(19.99)).toBe('$19.99');
    expect(formatCurrency(19.99)).toBe('$19.99');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles large numbers', () => {
    expect(formatPrice(1000)).toBe('$1,000.00');
    expect(formatPrice(1234567.89)).toBe('$1,234,567.89');
  });
});

describe('formatDate', () => {
  it('formats ISO string to localized short date', () => {
    const formatted = formatDate('2026-03-15T10:00:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Mar');
  });

  it('handles invalid dates gracefully', () => {
    expect(formatDate('invalid-date-string')).toBe('Invalid Date');
  });
});

describe('formatDateTime', () => {
  it('formats ISO string with time component', () => {
    const formatted = formatDateTime('2026-03-15T10:30:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Mar');
  });
});

describe('getOrderStatusVariant', () => {
  it('maps order statuses to appropriate badge variants', () => {
    expect(getOrderStatusVariant('pending')).toBe('outline');
    expect(getOrderStatusVariant('confirmed')).toBe('primary');
    expect(getOrderStatusVariant('processing')).toBe('primary');
    expect(getOrderStatusVariant('shipped')).toBe('secondary');
    expect(getOrderStatusVariant('delivered')).toBe('success');
    expect(getOrderStatusVariant('cancelled')).toBe('destructive');
    expect(getOrderStatusVariant('refunded')).toBe('destructive');
  });
});
