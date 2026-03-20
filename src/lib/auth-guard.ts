import { redirect } from '@tanstack/react-router'

interface AuthContext {
  isAuthenticated: boolean
  isLoading: boolean
}

export function requireAuth(context: AuthContext) {
  if (context.isLoading) {
    return
  }

  if (!context.isAuthenticated) {
    throw redirect({ to: '/login' })
  }
}

export function requireGuest(context: AuthContext) {
  if (context.isLoading) {
    return
  }

  if (context.isAuthenticated) {
    throw redirect({ to: '/' })
  }
}
