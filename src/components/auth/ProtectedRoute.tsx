import { useAuthToken } from '@convex-dev/auth/react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (token === null) {
      navigate({ to: '/login' })
    }
  }, [token, navigate])

  if (token === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (token === null) {
    return null
  }

  return <>{children}</>
}
