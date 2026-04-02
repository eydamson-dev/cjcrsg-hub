'use client'

import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '~/components/layout/Layout'
import { ProtectedRoute } from '~/components/auth/ProtectedRoute'
import { requireAuth } from '~/lib/auth-guard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { EventsBreadcrumb } from '~/features/events/components/EventsBreadcrumb'
import { GenericEventDetails } from '~/features/events/components/GenericEventDetails'
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import {
  useCreateEvent,
  useStartEvent,
} from '~/features/events/hooks/useEventMutations'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Event, EventType } from '~/features/events/types'

const searchSchema = z.object({
  type: z.string().optional(),
})

type SearchParams = z.infer<typeof searchSchema>

const EVENT_TYPE_ROUTES: Record<string, string> = {
  'Sunday Service': '/events/sunday-service',
  'Spiritual Retreat': '/events/spiritual-retreat',
}

const DEFAULT_TIMES: Record<string, { start: string; end: string }> = {
  'Sunday Service': { start: '09:00', end: '11:00' },
  'Spiritual Retreat': { start: '08:00', end: '16:00' },
}

export const Route = createFileRoute('/events/new')({
  component: CreateEventContent,
  validateSearch: searchSchema,
  beforeLoad: async ({ context }) => {
    requireAuth(context)
  },
})

export function CreateEventContent() {
  const navigate = useNavigate()
  const { data: eventTypes, isPending: isLoadingTypes } = useEventTypesList()
  const createEvent = useCreateEvent()
  const startEvent = useStartEvent()
  const searchParams = useSearch({ from: '/events/new' }) as SearchParams

  const [unsavedEvent, setUnsavedEvent] = useState<Event | null>(null)

  const handleSelectEventType = (eventTypeId: string) => {
    const eventType = eventTypes?.find((et) => et._id === eventTypeId)
    if (!eventType) return

    const now = Date.now()
    const today = new Date()
    const times = DEFAULT_TIMES[eventType.name] || {
      start: '09:00',
      end: '11:00',
    }

    const newEventType: EventType = {
      _id: eventType._id,
      name: eventType.name,
      color: eventType.color || '#3b82f6',
      isActive: eventType.isActive,
      createdAt: eventType.createdAt,
    }

    const newUnsavedEvent: Event = {
      _id: `unsaved-${now}`,
      name: `${eventType.name} - ${today.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
      eventTypeId: eventType._id,
      eventType: newEventType,
      date: now,
      startTime: times.start,
      endTime: times.end,
      location: '',
      description: '',
      status: 'upcoming',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    setUnsavedEvent(newUnsavedEvent)
  }

  const handleSave = async () => {
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

      const eventType = eventTypes?.find(
        (et) => et._id === unsavedEvent.eventTypeId,
      )
      const redirectUrl =
        EVENT_TYPE_ROUTES[eventType?.name || ''] || `/events/${eventId}`

      navigate({ to: redirectUrl })
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

  const handleCancel = () => {
    setUnsavedEvent(null)
  }

  if (isLoadingTypes) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6 p-4">
            <EventsBreadcrumb items={[{ label: 'Create New Event' }]} />
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  if (unsavedEvent) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="space-y-6 p-4">
            <EventsBreadcrumb items={[{ label: 'Create New Event' }]} />
            <GenericEventDetails
              event={unsavedEvent}
              mode="dashboard"
              isUnsaved
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6 p-4">
          <EventsBreadcrumb items={[{ label: 'Create New Event' }]} />

          {eventTypes && eventTypes.length > 0 && (
            <div className="rounded-lg border p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Event Type</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the type of event you want to create. This will
                  determine the form fields and options available.
                </p>
                <Select
                  value={searchParams.type || ''}
                  onValueChange={(value) =>
                    value && handleSelectEventType(value)
                  }
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select an event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        <div className="flex items-center gap-2">
                          {type.color && (
                            <span
                              className="size-3 rounded-full"
                              style={{ backgroundColor: type.color }}
                            />
                          )}
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
