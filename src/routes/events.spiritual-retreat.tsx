import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { EventsContent } from '~/features/events/components/EventsContent'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import { PageLoader } from '~/components/ui/loading-spinner'

export const Route = createFileRoute('/events/spiritual-retreat')({
  component: SpiritualRetreatPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

// Hardcoded event type name for Spiritual Retreat page
const RETREAT_NAME = 'Spiritual Retreat'

function SpiritualRetreatPage() {
  const { data: eventTypes, isPending } = useEventTypesList()

  const retreatType = eventTypes?.find((et) => et.name === RETREAT_NAME)

  if (!retreatType && !isPending) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">
              Retreat event type not found. Please create it first.
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
          title="Spiritual Retreat"
          subtitle="Manage spiritual retreat events"
          eventColor={retreatType?.color}
          eventTypeId={retreatType?._id}
          defaultEventName={(date) =>
            `Spiritual Retreat - ${date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}`
          }
          defaultStartTime="08:00"
          defaultEndTime="17:00"
          emptyStateTitle="No Spiritual Retreat Scheduled"
          emptyStateDescription="Start a Spiritual Retreat to begin tracking attendance."
          quickStartLabel="Start Spiritual Retreat"
          loader={<PageLoader message="Loading Spiritual Retreat..." />}
        />
      </Layout>
    </ProtectedRoute>
  )
}
