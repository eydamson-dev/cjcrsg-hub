import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { Button } from '~/components/ui/button'
import { Plus, History, Archive } from 'lucide-react'
import { requireAuth } from '~/lib/auth-guard'
import { EmptyEventState } from '~/features/events/components/EmptyEventState'
import { EventDetails } from '~/features/events/components/EventDetails'
import {
  useCurrentEvent,
  useEventStats,
} from '~/features/events/hooks/useEvents'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import {
  useCreateEvent,
  useStartEvent,
} from '~/features/events/hooks/useEventMutations'
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
  const [unsavedEvent, setUnsavedEvent] = useState<Event | null>(null)
  const { data: currentEvent, isLoading: isLoadingCurrent } = useCurrentEvent()
  const { data: stats, isLoading: isLoadingStats } = useEventStats()
  const { data: eventTypes } = useEventTypesList()
  const createEvent = useCreateEvent()
  const startEvent = useStartEvent()

  const handleStartUnsavedEvent = () => {
    if (!eventTypes || eventTypes.length === 0) {
      return
    }

    const firstEventType = eventTypes[0]
    const now = Date.now()
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    const eventType: EventType = {
      _id: firstEventType._id,
      name: firstEventType.name,
      color: firstEventType.color || '#3b82f6',
      isActive: firstEventType.isActive,
      createdAt: firstEventType.createdAt,
    }

    const newUnsavedEvent: Event = {
      _id: `unsaved-${now}`,
      name: `New Event - ${dateStr}`,
      eventTypeId: firstEventType._id,
      eventType,
      date: now,
      status: 'active',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    setUnsavedEvent(newUnsavedEvent)
  }

  const handleSaveUnsaved = async () => {
    if (!unsavedEvent) return

    try {
      // Create the event first
      const eventId = await createEvent.mutateAsync({
        name: unsavedEvent.name,
        eventTypeId: unsavedEvent.eventTypeId,
        description: unsavedEvent.description,
        date: unsavedEvent.date,
        startTime: unsavedEvent.startTime,
        endTime: unsavedEvent.endTime,
        location: unsavedEvent.location,
        bannerImage: unsavedEvent.bannerImage,
        media: unsavedEvent.media,
      })

      // Then immediately start it to set status to 'active'
      await startEvent.mutateAsync(eventId)

      setUnsavedEvent(null)
    } catch (error) {
      // Error is handled by the mutation hook (toast notification)
    }
  }

  const handleCancelUnsaved = () => {
    setUnsavedEvent(null)
  }

  const handleUpdateUnsaved = (updates: Partial<Event>) => {
    if (!unsavedEvent) return
    setUnsavedEvent({ ...unsavedEvent, ...updates })
  }

  if (isLoadingCurrent || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Show unsaved event if exists
  if (unsavedEvent) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Manage church events and services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/events/history')}
            >
              <History className="mr-2 h-4 w-4" />
              Event History
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/events/archive')}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button onClick={() => (window.location.href = '/events/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        <EventDetails
          event={unsavedEvent}
          mode="dashboard"
          isUnsaved
          onSave={handleSaveUnsaved}
          onCancel={handleCancelUnsaved}
          onUpdate={handleUpdateUnsaved}
        />
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Manage church events and services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/events/history')}
            >
              <History className="mr-2 h-4 w-4" />
              Event History
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/events/archive')}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button onClick={() => (window.location.href = '/events/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
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
          : 'None',
        nextScheduled: stats.nextUpcoming
          ? new Date(stats.nextUpcoming.date).toLocaleDateString()
          : 'None',
      }
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage church events and services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/events/history')}
          >
            <History className="mr-2 h-4 w-4" />
            Event History
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/events/archive')}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </Button>
          <Button onClick={() => (window.location.href = '/events/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <EmptyEventState
        stats={formattedStats}
        onStartEvent={handleStartUnsavedEvent}
      />
    </div>
  )
}
