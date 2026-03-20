import { useAuthContext } from '~/lib/auth-context'
import { AuthLoadingScreen } from './AuthLoadingScreen'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute - Visual wrapper for protected pages
 *
 * This component provides visual feedback (loading screen) while auth initializes.
 * The actual authentication protection is handled at the route level via beforeLoad hooks.
 * This creates a two-layer protection:
 * 1. beforeLoad: Prevents rendering if not authenticated (runs first)
 * 2. ProtectedRoute: Shows loading state during auth initialization
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = useAuthContext()

  // Show loading screen while auth initializes
  if (isLoading) {
    return <AuthLoadingScreen />
  }

  // Note: Authentication check is handled by route-level beforeLoad guards
  return <>{children}</>
}
