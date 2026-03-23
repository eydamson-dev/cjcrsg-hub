import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import { requireAuth } from '~/lib/auth-guard'
import { EmptyEventState } from '~/features/events/components/EmptyEventState'
import {
  useCurrentEvent,
  useEventStats,
} from '~/features/events/hooks/useEvents'
import type { Event } from '~/features/events/types'
import type { EventType } from '~/features/events/types'

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          </div>
        </div>
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
          _id: currentEvent.eventType.name, // Use name as placeholder ID
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

        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    LIVE
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{event.name}</h2>
                <p className="text-muted-foreground">{event.eventType?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {event.attendanceCount || 0}
                </p>
                <p className="text-sm text-muted-foreground">attendees</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {event.startTime && event.endTime
                ? `${event.startTime} - ${event.endTime}`
                : 'Time not set'}
              {event.location && ` • ${event.location}`}
            </div>
          </div>
        </div>
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
