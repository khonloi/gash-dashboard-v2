import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateMePayload, ChangePasswordPayload } from '@/services/userService';
import { UserQueryParams, UserRole } from '@/types/user';
import { STALE_TIME } from '@/lib/queryDefaults';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated users directory (Admin)
 */
export function useUsersQuery(params?: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAllUsers(params),
    staleTime: STALE_TIME.STANDARD,
  });
}

/**
 * Hook to fetch single user by ID (Admin)
 */
export function useUserDetailQuery(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME.STANDARD,
  });
}

/**
 * Mutation to update user role (Admin)
 */
export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.updateUserRole(id, role),
    onSuccess: (updatedUser, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(id), updatedUser);
    },
  });
}

/**
 * Mutation to delete user (Admin)
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Mutation to update current staff profile
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMePayload) => userService.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

/**
 * Mutation to change staff password
 */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => userService.changePassword(payload),
  });
}
