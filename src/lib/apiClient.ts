import { ApiError } from './errors';
import { STORAGE_KEYS, COOKIE_KEYS, SITE_CONFIG } from '@/constants/site';

export { ApiError };

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: QueryParams;
  timeoutMs?: number;
  retries?: number;
  demoMode?: boolean;
}

export type TokenRefreshHandler = () => Promise<string | null>;

let tokenRefreshHandler: TokenRefreshHandler | null = null;

export function setTokenRefreshHandler(handler: TokenRefreshHandler | null): void {
  tokenRefreshHandler = handler;
}

/**
 * Determine whether Demo Mode is active.
 * Checked via:
 * 1. Environment variable NEXT_PUBLIC_DEMO_MODE / DEMO_MODE ('true' forces on)
 * 2. Client-side localStorage override 'gash-dashboard-demo-mode' (only allowed in non-production environments)
 * 3. Environment variable explicitly set to 'false' disables demo mode in development (SSR & client)
 * 4. Otherwise defaults to true in development when unset
 */
export function isDemoModeActive(): boolean {
  const envDemo = (process.env.NEXT_PUBLIC_DEMO_MODE ?? process.env.DEMO_MODE ?? '')
    .trim()
    .toLowerCase();

  if (envDemo === 'true') {
    return true;
  }
  // In production, strictly prevent client-side localStorage overrides
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {
      // Ignore browser storage access errors
    }
  }
  if (envDemo === 'false') {
    return false;
  }
  // In development, default to active demo mode only if not explicitly configured otherwise
  return process.env.NODE_ENV === 'development';
}

/**
 * Manually toggle or override demo mode in browser storage (development/preview only)
 */
export function setDemoMode(enabled: boolean): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(enabled));
      document.cookie = `${COOKIE_KEYS.DEMO_MODE}=${enabled ? '1' : ''}; path=/; SameSite=Lax; ${
        enabled ? '' : 'expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }`;
    } catch {
      // Ignore
    }
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use internal backend URL or Next rewrite target
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || SITE_CONFIG.apiUrl;
  }
  // Client-side: can call direct backend URL or relative proxy path
  return process.env.NEXT_PUBLIC_API_URL || SITE_CONFIG.apiUrl;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const rawAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      return parsed?.state?.accessToken || null;
    }
  } catch {
    // Ignore JSON parse / storage errors
  }
  return null;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    token,
    params,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries,
    demoMode,
    ...customConfig
  } = options;

  // Intercept and route to in-memory mock handler when demo mode is active
  const shouldUseDemo = demoMode !== undefined ? demoMode : isDemoModeActive();
  if (shouldUseDemo) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const method = (customConfig.method || 'GET').toUpperCase();
    const { handleMockRequest } = await import('@/demo/mockApiHandler');
    return handleMockRequest<T>(method, cleanEndpoint, customConfig.body, params);
  }

  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let urlString = `${baseUrl}${cleanEndpoint}`;

  // If path already starts with /api/v1 and baseUrl ends with /api/v1, avoid duplication
  if (cleanEndpoint.startsWith('/api/v1')) {
    const rootUrl = baseUrl.replace(/\/api\/v1$/, '');
    urlString = `${rootUrl}${cleanEndpoint}`;
  }

  const defaultOrigin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = new URL(urlString, defaultOrigin);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.append(key, String(val));
      }
    });
  }

  const activeToken = token !== undefined ? token : getAuthToken();

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (activeToken) {
    reqHeaders['Authorization'] = `Bearer ${activeToken}`;
  }

  const method = (customConfig.method || 'GET').toUpperCase();
  const maxRetries = retries !== undefined ? retries : method === 'GET' ? 1 : 0;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    let removeAbortListener: (() => void) | undefined;
    if (customConfig.signal) {
      if (customConfig.signal.aborted) {
        controller.abort();
      } else {
        const onUserAbort = () => controller.abort();
        customConfig.signal.addEventListener('abort', onUserAbort, { once: true });
        removeAbortListener = () => customConfig.signal?.removeEventListener('abort', onUserAbort);
      }
    }

    try {
      const response = await fetch(url.toString(), {
        ...customConfig,
        headers: reqHeaders,
        signal: controller.signal,
      });

      // If response has no content (204)
      if (response.status === 204) {
        return null as unknown as T;
      }

      let data: Record<string, unknown> | null = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        // Handle 401 Token Refresh
        if (
          response.status === 401 &&
          activeToken &&
          attempt === 0 &&
          tokenRefreshHandler &&
          !url.pathname.includes('/auth/refresh-token')
        ) {
          try {
            const newAccessToken = await tokenRefreshHandler();
            if (newAccessToken) {
              reqHeaders['Authorization'] = `Bearer ${newAccessToken}`;
              continue; // Retry the original request
            }
          } catch {
            // Token refresh failed, continue to standard error throwing
          }
        }

        // Retry on 5xx server errors for GET requests
        if (response.status >= 500 && method === 'GET' && attempt < maxRetries) {
          lastError = new ApiError(`Server error (${response.status})`, response.status, data);
          await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
          continue;
        }

        const errorData = data?.error as Record<string, unknown> | undefined;
        const errorMessage =
          (data?.message as string | undefined) ||
          (errorData?.message as string | undefined) ||
          `Request failed with status ${response.status}`;
        throw new ApiError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (err: unknown) {
      if (timedOut) {
        lastError = new ApiError(`Request timed out after ${timeoutMs}ms`, 408);
      } else if (err instanceof ApiError) {
        throw err;
      } else {
        lastError = err;
      }

      // If caller explicitly aborted, do not retry
      if (customConfig.signal?.aborted) {
        throw lastError;
      }

      // Retry for GET requests on network/timeout errors
      if (method === 'GET' && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
        continue;
      }

      if (lastError instanceof ApiError) {
        throw lastError;
      }
      const message = lastError instanceof Error ? lastError.message : 'Network request failed';
      throw new ApiError(message, 0);
    } finally {
      clearTimeout(timer);
      if (removeAbortListener) {
        removeAbortListener();
      }
    }
  }

  if (lastError instanceof ApiError) {
    throw lastError;
  }
  throw new ApiError('Request failed after retries', 0);
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
