import { createSvgLogo, BaseLogoProps } from './logoFactory';

export type PaymentLogoProps = BaseLogoProps;

export const VisaLogo = createSvgLogo('/logos/payments/visa.svg', 'Visa', 3.0, 18);
export const MastercardLogo = createSvgLogo(
  '/logos/payments/mastercard.svg',
  'Mastercard',
  1.3,
  24
);
export const AmexLogo = createSvgLogo('/logos/payments/amex.svg', 'American Express', 1.6, 22);
export const ApplePayLogo = createSvgLogo('/logos/payments/apple-pay.svg', 'Apple Pay', 2.4, 20);
export const PayPalLogo = createSvgLogo('/logos/payments/paypal.svg', 'PayPal', 3.6, 18);
export const CodLogo = createSvgLogo('/logos/payments/cod.svg', 'Cash on Delivery', 2.6, 20);
