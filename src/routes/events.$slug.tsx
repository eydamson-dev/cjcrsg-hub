import { createFileRoute, Navigate } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { EventsContent } from '~/features/events/components/EventsContent'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import { PageLoader } from '~/components/ui/loading-spinner'

// Fallback route for event types without a hardcoded custom page
// Matches /events/{any-slug} and tries to find the event type by slug
export const Route = createFileRoute('/events/$slug')({
  component: EventTypeFallbackPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventTypeFallbackPage() {
  const { slug } = Route.useParams()
  const { data: eventTypes } = useEventTypesList()

  // Convert slug to name format (e.g., "prayer-meeting" → "prayer meeting")
  const searchName = slug.replace(/-/g, ' ')

  // Find event type by name (case-insensitive)
  const eventType = eventTypes?.find(
    (et) => et.name.toLowerCase() === searchName.toLowerCase(),
  )

  // If event type not found, redirect to general events page
  if (!eventType) {
    return <Navigate to="/events" />
  }

  // If event type has a hardcoded page (like sunday-service), this route shouldn't match
  // TanStack Router prioritizes exact matches: /events/sunday-service matches before /events/$slug
  // So we only reach here for event types WITHOUT their own page

  return (
    <ProtectedRoute>
      <Layout>
        <EventsContent
          title={eventType.name}
          subtitle={`Manage ${eventType.name} events`}
          eventColor={eventType.color}
          eventTypeId={eventType._id}
          defaultEventName={(date) =>
            `${eventType.name} - ${date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}`
          }
          emptyStateTitle={`No ${eventType.name} Today`}
          emptyStateDescription={`Start a new ${eventType.name} to begin tracking attendance.`}
          quickStartLabel={`Start ${eventType.name}`}
          loader={<PageLoader />}
        />
      </Layout>
    </ProtectedRoute>
  )
}
