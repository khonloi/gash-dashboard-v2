/**
 * Shared query cache stale time constants (in milliseconds).
 */
export const STALE_TIME = {
  INSTANT: 0,
  SHORT: 1000 * 60, // 1 minute
  STANDARD: 1000 * 60 * 5, // 5 minutes
  LONG: 1000 * 60 * 15, // 15 minutes
  DAY: 1000 * 60 * 60 * 24, // 24 hours
} as const;
