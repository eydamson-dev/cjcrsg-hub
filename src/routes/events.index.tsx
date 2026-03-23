import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import { requireAuth } from '~/lib/auth-guard'
import { EmptyEventState } from '~/features/events/components/EmptyEventState'
import { EventDetails } from '~/features/events/components/EventDetails'
import {
  useCurrentEvent,
  useEventStats,
} from '~/features/events/hooks/useEvents'
import type { Event, EventType } from '~/features/events/types'

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
        <EventsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function EventsContent() {
  const { data: currentEvent, isLoading: isLoadingCurrent } = useCurrentEvent()
  const { data: stats, isLoading: isLoadingStats } = useEventStats()

  if (isLoadingCurrent || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (currentEvent) {
    // Transform to match local Event type
    const eventType: EventType | undefined = currentEvent.eventType
      ? {
          _id: currentEvent.eventType.name,
          name: currentEvent.eventType.name,
          color: currentEvent.eventType.color || '#3b82f6',
          isActive: true,
          createdAt: currentEvent._creationTime,
        }
      : undefined

    const event: Event = {
      _id: currentEvent._id,
      name: currentEvent.name,
      eventTypeId: currentEvent.eventTypeId,
      eventType,
      description: currentEvent.description,
      date: currentEvent.date,
      startTime: currentEvent.startTime,
      endTime: currentEvent.endTime,
      location: currentEvent.location,
      status: currentEvent.status,
      bannerImage: currentEvent.bannerImage,
      media: currentEvent.media,
      isActive: currentEvent.isActive,
      createdAt: currentEvent._creationTime,
      updatedAt: currentEvent.updatedAt,
      completedAt: currentEvent.completedAt,
      attendanceCount: currentEvent.attendanceCount,
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Manage church events and services
            </p>
          </div>
          <Button onClick={() => (window.location.href = '/events/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        <EventDetails event={event} mode="dashboard" />
      </div>
    )
  }

  const formattedStats = stats
    ? {
        eventsThisMonth: stats.thisMonth,
        totalEvents: stats.totalEvents,
        lastEvent: stats.nextUpcoming
          ? new Date(stats.nextUpcoming.date).toLocaleDateString()
          : 'None yet',
        nextScheduled: stats.nextUpcoming
          ? new Date(stats.nextUpcoming.date).toLocaleDateString()
          : 'None scheduled',
      }
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage church events and services
          </p>
        </div>
        <Button onClick={() => (window.location.href = '/events/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <EmptyEventState stats={formattedStats} />
    </div>
  )
}
