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
import { useEventTypesList } from '~/features/events/hooks/useEventTypes'
import { useCreateEvent } from '~/features/events/hooks/useEventMutations'
import { EventFormFactory } from '~/features/events/forms/EventFormFactory'
import { z } from 'zod'

const searchSchema = z.object({
  type: z.string().optional(),
})

type SearchParams = z.infer<typeof searchSchema>

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
  const searchParams = useSearch({ from: '/events/new' }) as SearchParams

  const [selectedEventTypeId, setSelectedEventTypeId] = useState(
    searchParams.type || '',
  )

  const selectedEventType = eventTypes?.find(
    (et) => et._id === selectedEventTypeId,
  )

  const handleSave = async (data: unknown) => {
    const eventData = data as Parameters<typeof createEvent.mutateAsync>[0]
    const result = await createEvent.mutateAsync(eventData)

    if (selectedEventType?.name === 'Spiritual Retreat') {
      navigate({ to: '/events/spiritual-retreat' })
    } else {
      navigate({ to: '/events' })
    }

    return result
  }

  const handleCancel = () => {
    navigate({ to: '/events' })
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6 p-4">
          <EventsBreadcrumb items={[{ label: 'Create New Event' }]} />

          {!selectedEventTypeId && eventTypes && eventTypes.length > 0 && (
            <div className="rounded-lg border p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Event Type</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the type of event you want to create. This will
                  determine the form fields and options available.
                </p>
                <Select
                  value={selectedEventTypeId}
                  onValueChange={(value) => setSelectedEventTypeId(value || '')}
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

          {selectedEventTypeId && selectedEventType && (
            <EventFormFactory
              mode="create"
              eventTypeId={selectedEventTypeId}
              eventTypeName={selectedEventType.name}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
