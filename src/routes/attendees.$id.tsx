import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Layout } from '~/components/layout/Layout'

export const Route = createFileRoute('/attendees/$id')({
  component: AttendeeLayout,
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
