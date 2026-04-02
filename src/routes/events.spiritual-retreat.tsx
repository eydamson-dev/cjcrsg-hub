import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { EventPageHeader } from '~/features/events/components/EventPageHeader'
import { RetreatDetails } from '~/features/events/components/RetreatDetails'
import { EmptyEventState } from '~/features/events/components/EmptyEventState'
import { PageLoader } from '~/components/ui/loading-spinner'
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
  const { data: stats, isLoading: statsLoading } = useEventStats(
    retreatType?._id ? { eventTypeId: retreatType._id } : undefined,
  )

  const createEvent = useCreateEvent()
  const startEvent = useStartEvent()

  const [unsavedEvent, setUnsavedEvent] = useState<Event | null>(null)

  const isLoading = typesLoading || eventLoading || statsLoading

  const handleStartUnsavedEvent = () => {
    if (!retreatType) return

    const now = Date.now()
    const today = new Date()
    const name = `Spiritual Retreat - ${today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`

    const eventType: EventType = {
      _id: retreatType._id,
      name: retreatType.name,
      color: retreatType.color || '#22c55e',
      isActive: retreatType.isActive,
      createdAt: retreatType.createdAt,
    }

    const newUnsavedEvent: Event = {
      _id: `unsaved-${now}`,
      name,
      eventTypeId: retreatType._id,
      eventType,
      date: now,
      startTime: '08:00',
      endTime: '17:00',
      location: '',
      description: '',
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

      await startEvent.mutateAsync(eventId)
      setUnsavedEvent(null)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCancelUnsaved = () => {
    setUnsavedEvent(null)
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

  if (unsavedEvent) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <EventPageHeader
              title="Spiritual Retreat"
              subtitle="Manage spiritual retreat events"
              eventColor={retreatType?.color}
              eventTypeId={retreatType?._id}
            />
            <RetreatDetails
              event={unsavedEvent}
              isCreating
              onSave={handleSaveUnsaved}
              onCancel={handleCancelUnsaved}
            />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (currentEvent) {
    const eventType: EventType | undefined = currentEvent.eventType
      ? {
          _id: currentEvent.eventType.name,
          name: currentEvent.eventType.name,
          color: currentEvent.eventType.color || '#22c55e',
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
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <EventPageHeader
              title="Spiritual Retreat"
              subtitle="Manage spiritual retreat events"
              eventColor={retreatType?.color}
              eventTypeId={retreatType?._id}
            />
            <RetreatDetails event={event} layout="tabs" />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <EventPageHeader
            title="Spiritual Retreat"
            subtitle="Manage spiritual retreat events"
            eventColor={retreatType?.color}
            eventTypeId={retreatType?._id}
          />
          <EmptyEventState
            stats={formattedStats}
            onStartEvent={handleStartUnsavedEvent}
            title="No Spiritual Retreat Scheduled"
            description="Start a Spiritual Retreat to begin managing teachers, schedule, and staff."
            quickStartLabel="Start Spiritual Retreat"
          />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
