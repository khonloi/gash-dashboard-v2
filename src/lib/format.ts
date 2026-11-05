import type { BadgeProps } from '@/components/ui/Badge/Badge';
import type { Order } from '@/types/order';

/**
 * Formats a number as a currency string.
 * @param value The amount to format
 * @param currency The currency code (default: USD)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatPrice(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

export const formatCurrency = formatPrice;

/**
 * Formats an ISO date string or Date object into a localized human-readable date.
 * @param date ISO string, timestamp, or Date object
 * @param options Optional Intl.DateTimeFormatOptions
 * @param locale The locale to format with (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-US'
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(d);
}

/**
 * Formats an ISO date string or Date object into a localized human-readable date & time.
 * @param date ISO string, timestamp, or Date object
 * @param locale The locale to format with (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | number | Date, locale: string = 'en-US'): string {
  return formatDate(
    date,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    locale
  );
}

/**
 * Returns the appropriate Badge variant for an order status.
 */
export function getOrderStatusVariant(status: Order['status']): BadgeProps['variant'] {
  switch (status) {
    case 'pending':
      return 'outline';
    case 'confirmed':
    case 'processing':
      return 'primary';
    case 'shipped':
      return 'secondary';
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'refunded':
      return 'destructive';
    default:
      return 'default';
  }
}
