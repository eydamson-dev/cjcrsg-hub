import { Outlet, createFileRoute, useMatchRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { useEvent } from '~/features/events/hooks/useEvents'
import { EventDetails } from '~/features/events/components/EventDetails'
import {
  EventsBreadcrumb,
  BackLink,
} from '~/features/events/components/EventsBreadcrumb'
import type { Event, EventType } from '~/features/events/types'

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export const Route = createFileRoute('/events/$id')({
  component: EventDetailPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

function EventDetailPage() {
  const { id } = Route.useParams()
  const { data: event, isLoading } = useEvent(id)
  const matchRoute = useMatchRoute()
  const isEditRoute = matchRoute({ to: '/events/$id/edit', params: { id } })

  if (isEditRoute) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="mx-auto max-w-7xl p-4">
            <Outlet />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="mx-auto max-w-7xl p-4">
            <Outlet />
            <div className="flex h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!event) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="mx-auto max-w-7xl p-4">
            <Outlet />
            <div className="flex h-full items-center justify-center p-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold">Event Not Found</h2>
                <p className="mt-2 text-muted-foreground">
                  The event you're looking for doesn't exist or has been
                  deleted.
                </p>
              </div>
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

  // Generate parent URL based on event type
  const parentEventTypeId = event.eventTypeId
  const parentEventTypeName = event.eventType?.name
  const parentUrl = parentEventTypeName
    ? `/events/${toSlug(parentEventTypeName)}`
    : '/events'

  return (
    <ProtectedRoute>
      <Layout>
        <div className="mx-auto max-w-7xl p-4">
          <Outlet />
          <EventsBreadcrumb
            items={[{ label: event.name }]}
            parentEventTypeId={parentEventTypeId}
            parentEventTypeName={parentEventTypeName}
            showParentLink={!!parentEventTypeName}
          />
          <BackLink
            href={parentUrl}
            parentEventTypeName={parentEventTypeName}
          />
          <EventDetails event={eventData} mode="detail" />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
