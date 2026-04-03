import { useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export function useAccountInfo() {
  return useQuery(convexQuery(api.account.getAccountInfo, {}))
}

export function useUnlinkAccount() {
  return useConvexMutation(api.account.unlinkAccount)
}
