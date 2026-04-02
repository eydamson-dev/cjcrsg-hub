'use client'

import { useNavigate, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { EventsBreadcrumb } from '~/features/events/components/EventsBreadcrumb'
import { GenericEventDetails } from '~/features/events/components/GenericEventDetails'
import { useEvent } from '~/features/events/hooks/useEvents'
import { useUpdateEvent } from '~/features/events/hooks/useEventMutations'
import type { Event, EventType } from '~/features/events/types'

export const Route = createFileRoute('/events/$id/edit')({
  component: EditEventContent,
})

const EVENT_TYPE_ROUTES: Record<string, string> = {
  'Sunday Service': '/events/sunday-service',
  'Spiritual Retreat': '/events/spiritual-retreat',
}

function EditEventContent() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/events/$id/edit' })
  const { data: event, isLoading } = useEvent(id)
  const updateEvent = useUpdateEvent()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <EventsBreadcrumb items={[{ label: 'Loading...' }]} />
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading event...</div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <EventsBreadcrumb items={[{ label: 'Event Not Found' }]} />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold">Event Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The event you're looking for doesn't exist or has been deleted.
          </p>
          <button
            className="mt-4 text-primary hover:underline"
            onClick={() => navigate({ to: '/events' })}
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const eventTypeName = event.eventType?.name ?? 'Unknown'

  const handleSave = async () => {
    if (!event) return

    await updateEvent.mutateAsync({
      id: event._id,
      name: event.name,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
      bannerImage: event.bannerImage,
    })

    toast.success('Event updated successfully')

    const redirectUrl =
      EVENT_TYPE_ROUTES[eventTypeName] || `/events/${event._id}`
    navigate({ to: redirectUrl })
  }

  const handleCancel = () => {
    navigate({ to: '/events/$id', params: { id: event._id } })
  }

  const eventType: EventType | undefined = event.eventType
    ? {
        _id: event.eventType.name,
        name: event.eventType.name,
        color: event.eventType.color || '#3b82f6',
        isActive: true,
        createdAt: event._creationTime,
      }
    : undefined

  const eventForEdit: Event = {
    _id: event._id,
    name: event.name,
    eventTypeId: event.eventTypeId,
    eventType,
    description: event.description,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    status: event.status,
    bannerImage: event.bannerImage,
    media: event.media,
    isActive: event.isActive,
    createdAt: event._creationTime,
    updatedAt: event.updatedAt,
    completedAt: event.completedAt,
  }

  return (
    <div className="space-y-6">
      <EventsBreadcrumb
        items={[
          { label: event.name, href: `/events/${event._id}` },
          { label: 'Edit' },
        ]}
        parentEventTypeId={event.eventTypeId}
        parentEventTypeName={event.eventType?.name}
        showParentLink={!!event.eventType?.name}
      />
      <GenericEventDetails
        event={eventForEdit}
        mode="dashboard"
        isUnsaved
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
