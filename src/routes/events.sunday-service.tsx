import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { EventsContent } from '~/features/events/components/EventsContent'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'

export const Route = createFileRoute('/events/sunday-service')({
  component: SundayServicePage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

// Hardcoded event type name for Sunday Service page
const SUNDAY_SERVICE_NAME = 'Sunday service'

function SundayServicePage() {
  const { data: eventTypes, isLoading } = useEventTypesList()

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  const sundayServiceType = eventTypes?.find(
    (et) => et.name === SUNDAY_SERVICE_NAME,
  )

  if (!sundayServiceType) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">
              Sunday Service event type not found. Please create it first.
            </p>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <EventsContent
          title="Sunday Service"
          subtitle="Manage Sunday worship services"
          eventColor={sundayServiceType.color}
          eventTypeId={sundayServiceType._id}
          defaultEventName={(date) =>
            `Sunday Service - ${date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}`
          }
          defaultStartTime="09:00"
          defaultEndTime="11:00"
          emptyStateTitle="No Sunday Service Today"
          emptyStateDescription="Start a new Sunday Service to begin tracking attendance."
          quickStartLabel="Start Sunday Service"
        />
      </Layout>
    </ProtectedRoute>
  )
}
