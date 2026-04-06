import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useAccountInfo() {
  return useQuery(convexQuery(api.account.getAccountInfo, {}))
}

export function useUnlinkAccount() {
  return useConvexMutation(api.account.unlinkAccount)
}

export function useLinkOAuth() {
  const { signIn } = useAuthActions()
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)

  const linkOAuth = useCallback(
    async (provider: 'google' | 'facebook') => {
      setLinkingProvider(provider)

      try {
        const result = await signIn(provider)

        if (result.redirect) {
          window.location.href = result.redirect.toString()
          return { success: false, redirecting: true }
        } else if (result.signingIn) {
          toast.success(`${provider} account linked successfully`)
          return { success: true, redirecting: false }
        }

        return { success: false, redirecting: false }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to link account'

        if (
          message.includes('already linked') ||
          message.includes('already exists')
        ) {
          toast.error(
            `This ${provider} account is already linked to another user`,
          )
        } else {
          toast.error(message)
        }

        return { success: false, redirecting: false, error: message }
      } finally {
        setLinkingProvider(null)
      }
    },
    [signIn],
  )

  return {
    linkOAuth,
    linkingProvider,
  }
}
