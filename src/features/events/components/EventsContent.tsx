import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Plus, History, Archive } from 'lucide-react'
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

export interface EventsContentProps {
  title: string
  subtitle?: string
  eventColor?: string
  eventTypeId?: string
  defaultEventName: (date: Date) => string
  defaultStartTime?: string
  defaultEndTime?: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  quickStartLabel?: string
}

export function EventsContent({
  title,
  subtitle,
  eventColor,
  eventTypeId,
  defaultEventName,
  defaultStartTime,
  defaultEndTime,
  emptyStateTitle = 'No Active Event',
  emptyStateDescription,
  quickStartLabel = 'Start Event',
}: EventsContentProps) {
  const [unsavedEvent, setUnsavedEvent] = useState<Event | null>(null)
  const { data: currentEvent, isLoading: isLoadingCurrent } = useCurrentEvent({
    eventTypeId,
  })
  const { data: stats, isLoading: isLoadingStats } = useEventStats({
    eventTypeId,
  })
  const { data: eventTypes } = useEventTypesList()
  const createEvent = useCreateEvent()
  const startEvent = useStartEvent()

  const handleStartUnsavedEvent = () => {
    if (!eventTypes || eventTypes.length === 0) {
      return
    }

    const eventTypeToUse =
      eventTypes.find((et) => et._id === eventTypeId) || eventTypes[0]
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
      name: defaultEventName(today),
      eventTypeId: eventTypeToUse._id,
      eventType,
      date: now,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
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
      // Error is handled by the mutation hook
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

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {eventColor && (
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: eventColor }}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
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
  )

  if (unsavedEvent) {
    return (
      <div className="space-y-6">
        {renderHeader()}

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
        {renderHeader()}

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
      {renderHeader()}

      <EmptyEventState
        stats={formattedStats}
        onStartEvent={handleStartUnsavedEvent}
        title={emptyStateTitle}
        description={emptyStateDescription}
        quickStartLabel={quickStartLabel}
      />
    </div>
  )
}
