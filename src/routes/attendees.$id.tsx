import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Layout } from '~/components/layout/Layout'
import { requireAuth } from '~/lib/auth-guard'
import { AttendeesErrorBoundary } from '~/features/attendees/components/AttendeesErrorBoundary'

export const Route = createFileRoute('/attendees/$id')({
  component: AttendeeLayout,
  errorComponent: AttendeesErrorBoundary,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function AttendeeLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}
