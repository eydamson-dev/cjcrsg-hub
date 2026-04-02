'use client'

import { useNavigate, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { EventsBreadcrumb } from '~/features/events/components/EventsBreadcrumb'
import { useEvent } from '~/features/events/hooks/useEvents'
import { useUpdateEvent } from '~/features/events/hooks/useEventMutations'
import { EventFormFactory } from '~/features/events/forms/EventFormFactory'
import { SPIRITUAL_RETREAT_TYPE } from '~/features/events/forms/EventFormFactory'

export const Route = createFileRoute('/events/$id/edit')({
  component: EditEventContent,
})

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

  const handleSave = async (data: unknown) => {
    const eventData = data as {
      name: string
      date: number
      startTime?: string
      endTime?: string
      location?: string
      description?: string
      bannerImage?: string
      eventTypeId: string
    }

    const { bannerImage, ...updates } = eventData

    await updateEvent.mutateAsync({
      id: event._id,
      ...updates,
      ...(bannerImage ? { bannerImage } : {}),
    })

    toast.success('Event updated successfully')

    if (eventTypeName === SPIRITUAL_RETREAT_TYPE) {
      navigate({ to: '/events/spiritual-retreat' })
    } else {
      navigate({ to: '/events/$id', params: { id: event._id } })
    }
  }

  const handleCancel = () => {
    navigate({ to: '/events/$id', params: { id: event._id } })
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
      <EventFormFactory
        mode="edit"
        eventTypeId={event.eventTypeId}
        eventTypeName={eventTypeName}
        eventId={event._id}
        event={event as any}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
