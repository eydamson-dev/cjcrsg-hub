import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { EventArchive } from '~/features/events/components/EventArchive'
import { requireAuth } from '~/lib/auth-guard'

export const Route = createFileRoute('/events/archive')({
  component: EventsArchivePage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventsArchivePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <EventArchive />
      </Layout>
    </ProtectedRoute>
  )
}
