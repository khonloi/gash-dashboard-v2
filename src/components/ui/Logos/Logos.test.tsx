import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  ApplePayLogo,
  PayPalLogo,
  CodLogo,
  NikeLogo,
  AdidasLogo,
  PumaLogo,
  UnderArmourLogo,
  AsicsLogo,
  NewBalanceLogo,
  ReebokLogo,
  JordanLogo,
  MizunoLogo,
  SpeedoLogo,
  WilsonLogo,
  BrandLogo,
} from './index';

describe('Payment Logos', () => {
  it('renders all payment logos with appropriate accessibility labels', () => {
    const { unmount: u1 } = render(<VisaLogo />);
    expect(screen.getByLabelText('Visa')).toBeDefined();
    u1();

    const { unmount: u2 } = render(<MastercardLogo />);
    expect(screen.getByLabelText('Mastercard')).toBeDefined();
    u2();

    const { unmount: u3 } = render(<AmexLogo />);
    expect(screen.getByLabelText('American Express')).toBeDefined();
    u3();

    const { unmount: u4 } = render(<ApplePayLogo />);
    expect(screen.getByLabelText('Apple Pay')).toBeDefined();
    u4();

    const { unmount: u5 } = render(<PayPalLogo />);
    expect(screen.getByLabelText('PayPal')).toBeDefined();
    u5();

    const { unmount: u6 } = render(<CodLogo />);
    expect(screen.getByLabelText('Cash on Delivery')).toBeDefined();
    u6();
  });
});

describe('Brand Logos', () => {
  it('renders individual brand logos', () => {
    const { unmount: u1 } = render(<NikeLogo />);
    expect(screen.getByLabelText('Nike')).toBeDefined();
    u1();

    const { unmount: u2 } = render(<AdidasLogo />);
    expect(screen.getByLabelText('Adidas')).toBeDefined();
    u2();

    const { unmount: u3 } = render(<PumaLogo />);
    expect(screen.getByLabelText('Puma')).toBeDefined();
    u3();

    const { unmount: u4 } = render(<UnderArmourLogo />);
    expect(screen.getByLabelText('Under Armour')).toBeDefined();
    u4();

    const { unmount: u5 } = render(<AsicsLogo />);
    expect(screen.getByLabelText('Asics')).toBeDefined();
    u5();

    const { unmount: u6 } = render(<NewBalanceLogo />);
    expect(screen.getByLabelText('New Balance')).toBeDefined();
    u6();

    const { unmount: u7 } = render(<ReebokLogo />);
    expect(screen.getByLabelText('Reebok')).toBeDefined();
    u7();

    const { unmount: u8 } = render(<JordanLogo />);
    expect(screen.getByLabelText('Air Jordan')).toBeDefined();
    u8();

    const { unmount: u9 } = render(<MizunoLogo />);
    expect(screen.getByLabelText('Mizuno')).toBeDefined();
    u9();

    const { unmount: u10 } = render(<SpeedoLogo />);
    expect(screen.getByLabelText('Speedo')).toBeDefined();
    u10();

    const { unmount: u11 } = render(<WilsonLogo />);
    expect(screen.getByLabelText('Wilson')).toBeDefined();
    u11();
  });

  it('BrandLogo dynamically maps brand string to correct SVG or fallback', () => {
    const { unmount: u1 } = render(<BrandLogo brand="NIKE" />);
    expect(screen.getByLabelText('Nike')).toBeDefined();
    u1();

    const { unmount: u2 } = render(<BrandLogo brand="+ MORE BRANDS" />);
    expect(screen.getByText('+ MORE BRANDS')).toBeDefined();
    u2();

    const { unmount: u3 } = render(<BrandLogo brand="CUSTOM_BRAND" />);
    expect(screen.getByText('CUSTOM_BRAND')).toBeDefined();
    u3();
  });
});
