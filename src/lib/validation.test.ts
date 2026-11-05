import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone } from './validation';

describe('validation', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('first.last@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates valid phone numbers', () => {
      expect(isValidPhone('0912345678')).toBe(true);
      expect(isValidPhone('+84 912 345 678')).toBe(true);
      expect(isValidPhone('(028) 3822-1234')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghijk')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });
});
