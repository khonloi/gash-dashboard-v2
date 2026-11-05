import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authService,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from '@/services/authService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { STALE_TIME } from '@/lib/queryDefaults';

import { AuthTokens, UserProfile } from '@/types/user';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

async function handleAuthSuccess(
  data: { user: UserProfile; tokens: AuthTokens },
  queryClient: ReturnType<typeof useQueryClient>,
  setAuth: (user: UserProfile, tokens: AuthTokens) => void
) {
  if (data.user.role === 'customer') {
    throw new Error(
      'Access denied. Customer accounts cannot access the GASH Operations Dashboard.'
    );
  }
  setAuth(data.user, data.tokens);
  queryClient.setQueryData(authKeys.me, data.user);
}

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => handleAuthSuccess(data, queryClient, setAuth),
  });
}

export function useRegisterMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => handleAuthSuccess(data, queryClient, setAuth),
  });
}

export function useLogoutMutation() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout(refreshToken || undefined);
      } catch (err) {
        // Even if server logout errors, clear client state
        console.warn('Backend logout failed:', err);
      }
    },
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.me });
    },
  });
}

export function useMeQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const user = await userService.getMe();
      updateUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: STALE_TIME.STANDARD,
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, payload }: { token: string; payload: ResetPasswordPayload }) =>
      authService.resetPassword(token, payload),
  });
}
