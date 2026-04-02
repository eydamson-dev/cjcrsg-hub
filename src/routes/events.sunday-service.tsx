import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import { EventPageHeader } from '~/features/events/components/EventPageHeader'
import { SundayServiceDetails } from '~/features/events/components/SundayServiceDetails'
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
import { toast } from 'sonner'

export const Route = createFileRoute('/events/sunday-service')({
  component: SundayServicePage,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

const SUNDAY_SERVICE_NAME = 'Sunday Service'

function SundayServicePage() {
  const { data: eventTypes, isPending: isPendingTypes } = useEventTypesList()
  const sundayServiceType = eventTypes?.find(
    (et) => et.name === SUNDAY_SERVICE_NAME,
  )

  const { data: currentEvent, isLoading: isLoadingCurrent } = useCurrentEvent({
    eventTypeId: sundayServiceType?._id,
  })
  const { data: stats, isLoading: isLoadingStats } = useEventStats({
    eventTypeId: sundayServiceType?._id,
  })

  const createEvent = useCreateEvent()
  const startEvent = useStartEvent()

  const [unsavedEvent, setUnsavedEvent] = useState<Event | null>(null)

  const handleStartUnsavedEvent = () => {
    if (!eventTypes || eventTypes.length === 0) return

    const eventTypeToUse =
      eventTypes.find((et) => et._id === sundayServiceType?._id) ||
      eventTypes[0]
    const now = Date.now()
    const today = new Date()

    const eventType: EventType = {
      _id: eventTypeToUse._id,
      name: eventTypeToUse.name,
      color: eventTypeToUse.color || '#3b82f6',
      isActive: eventTypeToUse.isActive,
      createdAt: eventTypeToUse.createdAt,
    }

    const newUnsavedEvent: Event = {
      _id: `unsaved-${now}`,
      name: `Sunday Service - ${today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
      eventTypeId: eventTypeToUse._id,
      eventType,
      date: now,
      startTime: '09:00',
      endTime: '11:00',
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
      const message =
        error instanceof Error ? error.message : 'Failed to create event'
      if (message.includes('already') || message.includes('active')) {
        toast.error(
          'An active event already exists. Complete or cancel it first.',
        )
      } else {
        toast.error(message)
      }
    }
  }

  const handleCancelUnsaved = () => {
    setUnsavedEvent(null)
  }

  const isLoading = isPendingTypes || isLoadingCurrent || isLoadingStats

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoader message="Loading Sunday Service..." />
        </Layout>
      </ProtectedRoute>
    )
  }

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
              title="Sunday Service"
              subtitle="Manage Sunday worship services"
              eventColor={sundayServiceType.color}
              eventTypeId={sundayServiceType._id}
            />
            <SundayServiceDetails
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
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6">
            <EventPageHeader
              title="Sunday Service"
              subtitle="Manage Sunday worship services"
              eventColor={sundayServiceType.color}
              eventTypeId={sundayServiceType._id}
            />
            <SundayServiceDetails event={event} />
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
            title="Sunday Service"
            subtitle="Manage Sunday worship services"
            eventColor={sundayServiceType.color}
            eventTypeId={sundayServiceType._id}
          />
          <EmptyEventState
            stats={formattedStats}
            onStartEvent={handleStartUnsavedEvent}
            title="No Sunday Service Today"
            description="Start a new Sunday Service to begin tracking attendance."
            quickStartLabel="Start Sunday Service"
          />
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
