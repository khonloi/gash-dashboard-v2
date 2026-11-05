import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, AuthTokens } from '@/types/user';
import { STORAGE_KEYS, COOKIE_KEYS } from '@/constants/site';
import '@/lib/tokenRefresher';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: UserProfile, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  clearAuth: () => void;
}

function syncSessionCookie(active: boolean, role?: string): void {
  if (typeof document === 'undefined') return;
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const secureFlag = isProd ? '; Secure' : '';
    if (active) {
      document.cookie = `${COOKIE_KEYS.SESSION}=1; path=/; SameSite=Lax${secureFlag}`;
      if (role) {
        document.cookie = `${COOKIE_KEYS.ROLE}=${role}; path=/; SameSite=Lax${secureFlag}`;
      }
    } else {
      document.cookie = `${COOKIE_KEYS.SESSION}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
      document.cookie = `${COOKIE_KEYS.ROLE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
    }
  } catch {
    // Ignore browser cookie manipulation errors
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        syncSessionCookie(true, user.role);
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      setTokens: (tokens) => {
        syncSessionCookie(true);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        });
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      clearAuth: () => {
        syncSessionCookie(false);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          syncSessionCookie(true, state.user?.role);
        }
      },
    }
  )
);
