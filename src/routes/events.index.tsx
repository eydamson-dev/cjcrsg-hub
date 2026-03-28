import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { EventsContent } from '~/features/events/components/EventsContent'

export const Route = createFileRoute('/events/')({
  component: EventsPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <EventsContent
          title="Events"
          subtitle="Manage church events and services"
          defaultEventName={(date) => {
            const dateStr = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
            return `New Event - ${dateStr}`
          }}
          emptyStateTitle="No Active Event"
          quickStartLabel="Start Event"
        />
      </Layout>
    </ProtectedRoute>
  )
}
