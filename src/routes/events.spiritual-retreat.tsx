import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import { useCurrentEvent } from '~/features/events/hooks/useEvents'
import { useCreateEvent } from '~/features/events/hooks/useEventMutations'
import { RetreatDetails } from '~/features/events/components/RetreatDetails'
import { PageLoader } from '~/components/ui/loading-spinner'
import { Button } from '~/components/ui/button'
import { Plus, Mountain } from 'lucide-react'

export const Route = createFileRoute('/events/spiritual-retreat')({
  component: SpiritualRetreatPage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

const RETREAT_NAME = 'Spiritual Retreat'

function SpiritualRetreatPage() {
  const { data: eventTypes, isPending: typesLoading } = useEventTypesList()
  const retreatType = eventTypes?.find((et) => et.name === RETREAT_NAME)

  const { data: currentEvent, isPending: eventLoading } = useCurrentEvent(
    retreatType?._id ? { eventTypeId: retreatType._id } : undefined,
  )

  const createEvent = useCreateEvent()

  const isLoading = typesLoading || eventLoading

  const handleCreateEvent = async () => {
    if (!retreatType) return

    const today = new Date()
    const name = `Spiritual Retreat - ${today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`

    try {
      await createEvent.mutateAsync({
        name,
        eventTypeId: retreatType._id,
        date: today.getTime(),
        startTime: '08:00',
        endTime: '17:00',
        location: '',
        description: '',
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  if (!retreatType && !typesLoading) {
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoader message="Loading Spiritual Retreat..." />
        </Layout>
      </ProtectedRoute>
    )
  }

  if (!currentEvent) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center py-16">
            <Mountain className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No Spiritual Retreat Scheduled
            </h2>
            <p className="text-muted-foreground mb-6 text-center">
              Start a Spiritual Retreat to begin managing teachers, schedule,
              and staff.
            </p>
            <Button
              onClick={handleCreateEvent}
              disabled={createEvent.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              {createEvent.isPending
                ? 'Creating...'
                : 'Start Spiritual Retreat'}
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  // Cast to any to bypass type mismatch between query result and Event type
  return (
    <ProtectedRoute>
      <Layout>
        <RetreatDetails event={currentEvent as any} layout="tabs" />
      </Layout>
    </ProtectedRoute>
  )
}
