import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { TooltipProvider } from '~/components/ui/tooltip'
import { Toaster } from '~/components/ui/sonner'
import appCss from '~/styles/app.css?url'
import { AuthProvider, useAuthContext } from '~/lib/auth-context'
import { AuthLoadingScreen } from '~/components/auth/AuthLoadingScreen'

// Define the router context type including auth
export interface RouterContext {
  queryClient: QueryClient
  isAuthenticated: boolean
  isLoading: boolean
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CJCRSG Hub',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/cjcrsg-favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/cjcrsg-favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/cjcrsg-favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/cjcrsg-favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
  // Inject auth context into router context for beforeLoad hooks
  beforeLoad: async () => {
    // This will be called with the actual auth context from AuthContextInjector
    return {}
  },
  loader: async ({ context }) => {
    return {
      isAuthenticated: context.isAuthenticated,
      isLoading: context.isLoading,
    }
  },
})

function RootComponent() {
  return (
    <AuthProvider>
      <AuthContextInjector>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </AuthContextInjector>
    </AuthProvider>
  )
}

// Component that injects auth context into the router context
function AuthContextInjector({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  // Update router context with auth state
  React.useEffect(() => {
    router.update({
      context: {
        ...router.options.context,
        isAuthenticated,
        isLoading,
      },
    })
  }, [isAuthenticated, isLoading, router])

  // Show loading screen while auth initializes
  if (isLoading) {
    return <AuthLoadingScreen />
  }

  return <>{children}</>
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}
