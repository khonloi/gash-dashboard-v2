import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('extracts message from Error instance', () => {
    const error = new Error('Something went wrong');
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('handles string input directly', () => {
    expect(getErrorMessage('Custom error string')).toBe('Custom error string');
  });

  it('extracts message property from plain object', () => {
    const errorObj = { message: 'API validation failed', code: 422 };
    expect(getErrorMessage(errorObj)).toBe('API validation failed');
  });

  it('converts other primitives and objects to string', () => {
    expect(getErrorMessage(500)).toBe('500');
    expect(getErrorMessage(null)).toBe('Unknown error occurred');
    expect(getErrorMessage(undefined)).toBe('Unknown error occurred');
  });
});
