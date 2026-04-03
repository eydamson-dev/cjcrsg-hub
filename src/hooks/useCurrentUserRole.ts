import { useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user'

export function useCurrentUserRole() {
  return useQuery(convexQuery(api.users.getCurrentUser, {}))
}

export function useListUsersWithRoles() {
  return useQuery(convexQuery(api.admin.listUsersWithRoles, {}))
}

export function usePromoteUser() {
  const mutationFn = useConvexMutation(api.admin.promoteUser)
  return mutationFn
}

export function useDemoteUser() {
  const mutationFn = useConvexMutation(api.admin.demoteUser)
  return mutationFn
}
