import { useAuthActions, useAuthToken } from '@convex-dev/auth/react'
import { useNavigate } from '@tanstack/react-router'

export function useAuth() {
  const { signIn, signOut } = useAuthActions()
  const token = useAuthToken()
  const navigate = useNavigate()

  return {
    isAuthenticated: !!token,
    signIn,
    signOut,
    token,
    logout: async () => {
      await signOut()
      navigate({ to: '/login' })
    },
  }
}

export async function signInWithPassword(
  email: string,
  password: string,
  signIn: Function,
) {
  return await signIn('password', { email, password })
}

export async function signUpWithPassword(
  email: string,
  password: string,
  signIn: Function,
) {
  return await signIn('password', { email, password, flow: 'signUp' })
}

export async function signInWithGoogle(signIn: Function) {
  return await signIn('google')
}

export async function signInWithFacebook(signIn: Function) {
  return await signIn('facebook')
}
