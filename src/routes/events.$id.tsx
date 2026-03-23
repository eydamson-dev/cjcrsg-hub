import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { useEvent } from '~/features/events/hooks/useEvents'
import { EventDetails } from '~/features/events/components/EventDetails'
import type { Event, EventType } from '~/features/events/types'

export const Route = createFileRoute('/events/$id')({
  component: EventDetailPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventDetailPage() {
  const { id } = Route.useParams()
  const { data: event, isLoading } = useEvent(id)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!event) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Event Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                The event you're looking for doesn't exist or has been deleted.
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  // Transform to match local Event type
  const eventType: EventType | undefined = event.eventType
    ? {
        _id: event.eventType.name,
        name: event.eventType.name,
        color: event.eventType.color || '#3b82f6',
        isActive: true,
        createdAt: event._creationTime,
      }
    : undefined

  const eventData: Event = {
    ...event,
    eventType,
  }

  return (
    <ProtectedRoute>
      <Layout>
        <EventDetails event={eventData} mode="detail" />
      </Layout>
    </ProtectedRoute>
  )
}
