import { createContext, useContext, type ReactNode } from 'react'
import { useAuthToken } from '@convex-dev/auth/react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useAuthToken()

  const isLoading = token === undefined
  const isAuthenticated = token !== null && token !== undefined

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
